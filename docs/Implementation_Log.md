# Debugging Plan for deploy.sh

## Goal
Identify why `minikube` command becomes unavailable at line 54 of `deploy.sh` after apparently succeeding at line 31.

## Proposed Changes
### `deploy.sh`
- Add `set -x` temporarily to see the execution trace (optional, maybe too noisy).
- Add explicit checks before line 54:
  ```bash
  echo "DEBUG: PATH is ${PATH}"
  which minikube
  type minikube
  ```
- Capture output of `minikube docker-env` to see if it corrupts the environment.
  ```bash
  # Modify line 41
  DOCKER_ENV_OUTPUT=$(minikube docker-env)
  echo "DEBUG: docker-env output: ${DOCKER_ENV_OUTPUT}"
  eval "${DOCKER_ENV_OUTPUT}"
  ```

## Verification
- Run `./deploy.sh` and observe the output.
- If `minikube` is indeed missing later, checking the PATH will reveal if it was overwritten.
