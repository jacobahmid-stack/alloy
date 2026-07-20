# Kill the paste loop: give Claude Code a scoped path to the box

2026-07-04. Ten minutes of IAM, done once. After this, Claude deploys to db.forj.se and reads
diagnostics back by itself via SSM Run Command; the browser SSM terminal becomes break-glass only.
Every command is CloudTrail-logged. You handle all credentials yourself, per the standing rule.

## What this enables (and what it does not)

- Claude runs shell commands on the box through `aws ssm send-command` and fetches the output
  with `aws ssm get-command-invocation`. Deploy, migrate, probe, read the funnel numbers: no pastes.
- It does NOT open any port on the box, does not add SSH, does not touch other instances,
  and cannot manage IAM, billing, or any other AWS service. One instance, one document, logged.

## Step 1: find the instance id

EC2 console (region **eu-north-1**, account 701275662474) → Instances → the db.forj.se box →
copy its Instance ID (i-XXXXXXXXXXXXXXXXX). You will paste it into the policy below.

## Step 2: create the policy

IAM → Policies → Create policy → JSON. Replace BOTH `i-XXXXXXXXXXXXXXXXX` placeholders.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RunOnTheBoxOnly",
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ec2:eu-north-1:701275662474:instance/i-XXXXXXXXXXXXXXXXX",
        "arn:aws:ssm:eu-north-1::document/AWS-RunShellScript"
      ]
    },
    {
      "Sid": "ReadResultsBack",
      "Effect": "Allow",
      "Action": [
        "ssm:GetCommandInvocation",
        "ssm:ListCommandInvocations",
        "ssm:ListCommands"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ResolveTheInstance",
      "Effect": "Allow",
      "Action": [
        "ssm:DescribeInstanceInformation",
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

Name it `claude-box-runcommand`.

## Step 3: create the user + key

IAM → Users → Create user `claude-box-deploy` (no console access) → Attach policies directly →
`claude-box-runcommand` → Create. Then Security credentials → Create access key → CLI.

## Step 4: configure the CLI locally (you type the key, never in chat)

In a terminal on this machine:

```
aws configure --profile forj-box
```

Enter the access key + secret when prompted, region `eu-north-1`, output `json`.
The key lands in `~/.aws/credentials` under the `forj-box` profile. Tell Claude "box access ready"
and from then on deploys and diagnostics run through `--profile forj-box`, no pastes.

## Rotation / kill switch

Deactivate or delete the access key in IAM at any time; nothing else depends on it.
CloudTrail → Event history → filter on the user to audit every command ever sent.

## Status (2026-07-04)

- ✅ **SSM Run Command LIVE.** `claude-box-deploy` verified; first deploys and diagnostics already
  ran through it (Phase B shipped this way, zero pastes). Instance `i-0f5162624bebb00d8`.
- 🟡 **GitOps puller: one click left.** The box generated a read-only deploy key (private key never
  left the box) and the repo now carries `box/DEPLOY_MANIFEST` + `box/box-deploy.sh` + `box/sql/`.
  **Your click:** GitHub → Novalo-Technologies/alloy-page → Settings → Deploy keys → Add deploy key
  → title `forj-box puller` → paste the public key below → leave "Allow write access" UNCHECKED → Add.

  ```
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDGPPWrFKHeT3nW6wwHo75HaDTByoe8Hv9aFL/EcFwk6 forj-box-deploy
  ```

  Then say "deploy key added" and Claude clones the repo on the box, installs the systemd timer,
  and proves the loop end to end (comment bump → push → box self-deploys inside a minute).
- ⬜ **SSH-over-SSM (interactive, for humans).** Three steps when you want it:
  1. Install the AWS Session Manager plugin on this machine (official AWS installer,
     https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
     — or tell Claude "install the plugin" and it runs the download with your go-ahead).
  2. Add to the `claude-box-runcommand` policy (or a new one on your own user):
     `ssm:StartSession` on the instance ARN + `arn:aws:ssm:eu-north-1::document/AWS-StartSSHSession`.
  3. Claude then generates you a local SSH keypair, installs the public half on the box via SSM,
     and writes the `~/.ssh/config` ProxyCommand entry so `ssh forj-box` just works.
