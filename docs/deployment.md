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
   pushes it to `ghcr.io/mitaito/milab` as `latest`, plus `sha-<commit>` so every
   build stays traceable.
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
  gets a read-only token and **no secrets** (`KUBE_CONFIG` is not available);
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
`mitaito-lab` namespace is created by the first deploy.

### 2. The kubeconfig secret

One **repository secret**, `KUBE_CONFIG`, holding the base64-encoded kubeconfig.
`k8s/admin.conf` is that kubeconfig. It is listed in `.gitignore` and must never
be committed: it carries a cluster-admin key, and this repository is public.

```bash
base64 -i k8s/admin.conf | gh secret set KUBE_CONFIG --repo mitaito/lab
```

Things to know about this credential:

- It is a kubeadm admin certificate, **valid until 2027-10-29**. Deploys fail
  after that until you renew it and set the secret again.
- It is full cluster-admin. A ServiceAccount limited to the `mitaito-lab`
  namespace would be safer, and its token would not expire on a calendar.
- GitHub-hosted runners can reach the API server at the address in the
  kubeconfig's `server:` field, and its certificate includes that address, so
  TLS verifies.

Nothing else needs configuring.

### 3. The image pull secret

The `milab` package on GHCR is private like your other images, and Secrets are
per-namespace, so copy `ghcr-creds` from `mi-caro` into the new namespace once:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl -n mi-caro get secret ghcr-creds -o jsonpath='{.data.\.dockerconfigjson}' \
  | base64 -d \
  | kubectl -n mitaito-lab create secret generic ghcr-creds \
      --type=kubernetes.io/dockerconfigjson --from-file=.dockerconfigjson=/dev/stdin
```

Until it exists the first rollout sits in `ImagePullBackOff`. The token behind it
needs read access to the `milab` package.

## Day to day

- **Ship a change, including `content/`:** merge to `main`. Pages are
  prerendered when the image is built, so content edits go through the pipeline
  like code.
- **Redeploy without a change:** Actions, Deploy, Run workflow, on `main`. On any
  other branch only Verify runs.
- **Roll back:** revert the commit on `main` and let the pipeline redeploy.
  `kubectl rollout undo` does **not** help here: every revision says `:latest`, so
  an older revision would pull the newest image again. For a quick manual step
  back, run an older build by its tag:
  `kubectl -n mitaito-lab set image deployment/lab web=ghcr.io/mitaito/milab:sha-<commit>`.
  The next deploy returns to `latest`.
- **Look around:**
  `kubectl -n mitaito-lab get pods,ingress,certificate`.

The first deploy can take a couple of minutes while cert-manager issues the
certificate. The smoke test retries for about two minutes. If it still fails
because DNS is not pointing at the cluster yet, the pods are already updated:
fix DNS and re-run the workflow.

## The manifests

`k8s/` is a plain Kustomize base: `namespace.yaml`, `deployment.yaml`,
`service.yaml`, `ingress.yaml`. Replica count and resource requests are
starting values, so tune them to your cluster. To check a change against the
cluster without applying it:

```bash
kubectl apply -k k8s --dry-run=server
```
