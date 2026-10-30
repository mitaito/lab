# Deploying to Kubernetes

Two workflows in `.github/workflows/`:

| File           | Name     | Runs on                | Does                                             |
| -------------- | -------- | ---------------------- | ------------------------------------------------ |
| `deploy.yml`   | Deploy   | push to `main`, manual | Verify, publish the image, roll it out           |
| `pr-check.yml` | PR check | pull requests          | Verify and build the image. Nothing is published |
| `verify.yml`   | Verify   | called by the above    | Lint, type-check, unit tests                     |

`verify.yml` is shared, so a change is held to the same checks before review and
before release.

## Deploy

Every push to `main` runs three jobs:

1. **Verify**: ESLint, type-check and unit tests.
2. **Build and push image**: builds the Docker image with `SITE_URL` baked in and
   pushes it to `ghcr.io/mitaito/mi-lab` with the single tag `latest`.
3. **Deploy to Kubernetes**: applies `k8s/`, restarts the Deployment so every pod
   pulls the new `latest` (`imagePullPolicy: Always`), waits for the rollout,
   then requests the public URL as a smoke test.

The restart is needed because the manifests name `:latest` and do not change
when only the image does. The old pods keep serving until the new ones pass
their readiness probe, so a bad release does not take the site down.

The site's address, `https://mitaito.com`, is written in two places that must
agree: `SITE_URL` in `deploy.yml` (baked into canonical URLs, the sitemap and
share images) and the host in `k8s/ingress.yaml`.

## Pull requests

Anyone can open a pull request, so `pr-check.yml` is built for untrusted code.
It lints, type-checks and tests the change and builds the image (which also
validates `content/`), but it:

- triggers on `pull_request`, never `pull_request_target`, so code from a fork
  gets a read-only token and **no secrets** (`K8S_TOKEN` is not available);
- never logs in to GHCR, pushes an image or touches the cluster;
- checks out without persisting credentials and only reads the build cache.

Keep it that way: do not switch it to `pull_request_target` and do not give it
secrets.

Recommended repository settings (Settings, Actions, General):

- **Fork pull request workflows from outside collaborators**: "Require approval
  for all outside collaborators", so a maintainer looks at a fork's PR before
  any of its code runs on a runner.
- **Workflow permissions**: "Read repository contents and packages permissions".
- Optionally, a branch protection rule on `main` that requires the **PR check**
  jobs to pass.

## One-time setup

### 1. The cluster

The names in `k8s/` were checked against the live cluster:

- Ingress class **`traefik`** (the only one, and the default). There is no
  ingress-nginx.
- ClusterIssuer **`letsencrypt-prod`** (and `letsencrypt-staging`), from
  cert-manager.
- One amd64 node, matching the image GitHub builds.
- The `mi-caro` app already runs the same way: `ghcr.io/mitaito/<name>:latest`,
  `imagePullPolicy: Always`, pull secret `ghcr-creds`.

Still on you: a **DNS record** for `mitaito.com` that reaches the cluster
(it resolves through Cloudflare today, like `caro.mitaito.com`). The
`mi-lab` namespace and the `deployer` ServiceAccount that CI uses come from the
[devops repository](https://github.com/mitaito/devops/blob/main/k8s/README.md)
(`k8s/service-account/mi-lab`), not from this one. Apply that first.

### 2. The deploy token

Three **repository secrets** carry the token of the `deployer` ServiceAccount, so
the workflow never holds a cluster-admin credential (this repository is public).
Run this where the cluster-admin kubeconfig is, after the devops repository has
created the ServiceAccount:

```bash
K=/path/to/admin.conf
gh secret set K8S_SERVER  --repo mitaito/mi-lab --body "$(kubectl --kubeconfig $K config view --minify -o jsonpath='{.clusters[0].cluster.server}')"
gh secret set K8S_CA_DATA --repo mitaito/mi-lab --body "$(kubectl --kubeconfig $K config view --minify --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')"
gh secret set K8S_TOKEN   --repo mitaito/mi-lab --body "$(kubectl --kubeconfig $K -n mi-lab get secret deployer-token -o jsonpath='{.data.token}' | base64 -d)"
```

If a `KUBE_CONFIG` secret from the earlier setup still exists, delete it:
`gh secret delete KUBE_CONFIG --repo mitaito/mi-lab`.

Things to know about this credential:

- The ServiceAccount can apply and roll out this app in the `mi-lab` namespace
  and read its pods, events and certificate. It cannot read Secrets, delete
  anything or touch another namespace, so a leaked token does limited damage.
- The token does not expire. To rotate it, delete the `deployer-token` Secret in
  the `mi-lab` namespace, apply `k8s/service-account/mi-lab` from the devops
  repository again, and rerun the three commands.
- GitHub-hosted runners can reach the API server at the address in `K8S_SERVER`,
  and its certificate includes that address, so TLS verifies.
- A new kind of resource in `k8s/` (a ConfigMap, a CronJob) needs a matching rule
  in the devops repository first, or the deploy is refused with `Forbidden`.

Nothing else needs configuring.

### 3. Image visibility

The cluster pulls `ghcr.io/mitaito/mi-lab:latest` anonymously, so the `mi-lab`
package must be public. A new package starts private: open the mitaito
organization, Packages, `mi-lab`, Package settings, Change visibility, Public.
Until then the rollout sits in `ImagePullBackOff`.

To keep the package private instead, add an `imagePullSecrets` entry to
`k8s/deployment.yaml` and create that secret in the `mi-lab` namespace (the
`mi-caro` namespace does this with `ghcr-creds`).

## Day to day

- **Ship a change, including `content/`:** merge to `main`. Pages are
  prerendered when the image is built, so content edits go through the pipeline
  like code.
- **Redeploy without a change:** Actions, Deploy, Run workflow, on `main`. On any
  other branch only Verify runs.
- **Roll back:** revert the commit on `main` and let the pipeline redeploy.
  `kubectl rollout undo` does **not** help here: every revision says `:latest`, so
  an older revision would pull the newest image again. There is no per-commit
  tag to step back to, because `latest` is the only tag.
- **Look around:**
  `kubectl -n mi-lab get pods,ingress,certificate`.

The first deploy can take a couple of minutes while cert-manager issues the
certificate. The smoke test retries for about two minutes. If it still fails
because DNS is not pointing at the cluster yet, the pods are already updated:
fix DNS and re-run the workflow.

## The manifests

`k8s/` is a plain Kustomize base: `deployment.yaml`, `service.yaml`,
`hpa.yaml`, `ingress.yaml`. The namespace is not in it: the deploy token cannot
manage namespaces, so the devops repository creates it. The HorizontalPodAutoscaler runs
between 1 and 5 pods and adds one when average CPU passes 70% of the pod's
request. It needs metrics-server, which the cluster has. The Deployment leaves
`replicas` unset on purpose: setting it would reset the count on every deploy.
On a single node, extra pods cover load, a pod crash and a rollout, not losing
the node. Resource requests are starting values, and the autoscaler's CPU
target is measured against them, so tune them to your cluster. To check a change
against the cluster without applying it:

```bash
kubectl apply -k k8s --dry-run=server
```
