import os
import shutil
import json
import subprocess
import re
import sys
import argparse
import tempfile
import time
from datetime import datetime

# --- Configuration ---
UPDATE_DIR = "___update"
BACKUP_PREFIX = ".backup_synch_"
# Next.js folders to migrate
SOURCE_DIRS = ["app", "components", "hooks", "lib"]
# Critical config files to overwrite (after merging package.json and next.config.ts)
FILES_TO_OVERWRITE = [
    "tsconfig.json", 
    "package-lock.json", 
    "postcss.config.mjs", 
    "eslint.config.mjs",
    ".eslintrc.json",
    ".gitignore",
    ".env.example"
]

# --- Colors for Terminal ---
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

    @staticmethod
    def log(msg, level="info"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "info":
            print(f"{Colors.OKBLUE}[INFO {timestamp}]{Colors.ENDC} {msg}")
        elif level == "success":
            print(f"{Colors.OKGREEN}[OK {timestamp}]{Colors.ENDC} {msg}")
        elif level == "warn":
            print(f"{Colors.WARNING}[WARN {timestamp}]{Colors.ENDC} {msg}")
        elif level == "error":
            print(f"{Colors.FAIL}[ERROR {timestamp}]{Colors.ENDC} {msg}")

class NextjsUpdater:
    def __init__(self, auto_confirm=False, no_deploy=False, no_commit=False):
        self.root_dir = os.getcwd()
        self.update_path = os.path.join(self.root_dir, UPDATE_DIR)
        self.backup_path = None
        self.auto_confirm = auto_confirm
        self.skip_deploy = no_deploy
        self.skip_commit = no_commit

    def validate_environment(self):
        """Ensure the update directory exists and environment is sane."""
        if not os.path.exists(self.update_path):
            Colors.log(f"Update directory '{UPDATE_DIR}' not found. Aborting.", "error")
            sys.exit(1)
        
        # Check if git is initialized
        if not os.path.exists(os.path.join(self.root_dir, ".git")):
            Colors.log("Not a git repository. Some operations may fail.", "warn")

    def create_backup(self):
        """Create a temporary backup of critical files before modification."""
        self.backup_path = tempfile.mkdtemp(prefix=BACKUP_PREFIX)
        Colors.log(f"Creating safety backup at: {self.backup_path}...", "info")
        
        try:
            # Backup source directories
            for d in SOURCE_DIRS:
                src_d = os.path.join(self.root_dir, d)
                if os.path.exists(src_d):
                    shutil.copytree(src_d, os.path.join(self.backup_path, d))
            
            # Backup configs
            for f in ["package.json", "next.config.ts"] + FILES_TO_OVERWRITE:
                src_f = os.path.join(self.root_dir, f)
                if os.path.exists(src_f):
                    shutil.copy2(src_f, os.path.join(self.backup_path, f))
        except Exception as e:
            Colors.log(f"Backup failed: {e}", "error")
            sys.exit(1)

    def restore_backup(self):
        """Restore files from backup in case of failure."""
        if not self.backup_path or not os.path.exists(self.backup_path):
            return

        Colors.log("Restoring from backup due to failure...", "warn")
        try:
            # Restore source directories
            for d in SOURCE_DIRS:
                path = os.path.join(self.root_dir, d)
                if os.path.exists(path):
                    shutil.rmtree(path)
                backup_src = os.path.join(self.backup_path, d)
                if os.path.exists(backup_src):
                    shutil.copytree(backup_src, path)

            # Restore configs
            for f in os.listdir(self.backup_path):
                if f in SOURCE_DIRS: continue
                shutil.copy2(os.path.join(self.backup_path, f), os.path.join(self.root_dir, f))
            
            Colors.log("Restoration complete.", "success")
        except Exception as e:
            Colors.log(f"CRITICAL: Failed to restore backup! Manual intervention required at {self.backup_path}", "error")

    def cleanup(self, success=True):
        """Cleanup backup and update directory."""
        if self.backup_path and os.path.exists(self.backup_path):
            if success:
                shutil.rmtree(self.backup_path)
            else:
                Colors.log(f"Backup kept at {self.backup_path} for manual inspection.", "info")

        if success and os.path.exists(self.update_path):
            Colors.log(f"Removing update directory '{UPDATE_DIR}'...", "info")
            shutil.rmtree(self.update_path)

    def run_command(self, cmd, shell=True):
        """Run a shell command and handle errors."""
        try:
            Colors.log(f"Running: {cmd}", "info")
            subprocess.check_call(cmd, shell=shell)
        except subprocess.CalledProcessError:
            Colors.log(f"Command failed: {cmd}", "error")
            raise Exception("Command execution failed")

    def merge_package_json(self):
        Colors.log("Smart merging package.json...", "info")
        old_path = os.path.join(self.root_dir, "package.json")
        new_path = os.path.join(self.update_path, "package.json")

        with open(old_path, 'r') as f: old_pkg = json.load(f)
        with open(new_path, 'r') as f: new_pkg = json.load(f)

        # 1. Preserve critical keys
        for key in ['name', 'version', 'homepage']:
            if key in old_pkg:
                new_pkg[key] = old_pkg[key]
        
        # 2. Merge Scripts (Preserve 'predeploy'/'deploy' for GH Pages)
        if 'scripts' not in new_pkg: new_pkg['scripts'] = {}
        if 'scripts' in old_pkg:
            for s in ['predeploy', 'deploy']:
                if s in old_pkg['scripts']:
                    new_pkg['scripts'][s] = old_pkg['scripts'][s]

        # 3. Smart Dependency Merge
        for dep_type in ['dependencies', 'devDependencies']:
            if dep_type not in old_pkg: continue
            if dep_type not in new_pkg: new_pkg[dep_type] = {}
            
            # Add local/existing deps that are missing in new_pkg (like gh-pages)
            for dep, ver in old_pkg[dep_type].items():
                if dep not in new_pkg[dep_type]:
                    new_pkg[dep_type][dep] = ver
                    Colors.log(f"Preserving local dependency: {dep}", "info")

        with open(old_path, 'w') as f:
            json.dump(new_pkg, f, indent=2)

    def merge_next_config(self):
        Colors.log("Smart merging next.config.ts...", "info")
        old_path = os.path.join(self.root_dir, "next.config.ts")
        new_path = os.path.join(self.update_path, "next.config.ts")

        if not os.path.exists(new_path):
            Colors.log("next.config.ts not found in update. Skipping merge.", "warn")
            return

        with open(old_path, 'r') as f: old_content = f.read()
        with open(new_path, 'r') as f: new_content = f.read()

        # Robustly preserve critical Next.js static export settings
        # Using regex to capture existing values from old_content
        patterns = {
            'basePath': r'basePath\s*:\s*(["\'])(.*?)\1',
            'output': r'output\s*:\s*(["\'])(.*?)\1',
            'trailingSlash': r'trailingSlash\s*:\s*(true|false)',
        }

        preserved_values = {}
        for key, pattern in patterns.items():
            match = re.search(pattern, old_content)
            if match:
                preserved_values[key] = match.group(0) # The whole line/match

        for key, val in preserved_values.items():
            Colors.log(f"Preserving Next.js config: {val}", "info")
            if re.search(patterns[key], new_content):
                new_content = re.sub(patterns[key], val, new_content)
            else:
                new_content = re.sub(
                    r'(const\s+nextConfig\s*:\s*NextConfig\s*=\s*\{)', 
                    f'\\1\n  {val},', 
                    new_content, 
                    count=1
                )

        # Special handling for images.unoptimized
        if 'unoptimized: true' in old_content or 'unoptimized: false' in old_content:
            Colors.log("Preserving Next.js config: unoptimized", "info")
            if 'images:' in new_content:
                # If images block exists, try to inject/replace within it
                if 'unoptimized:' in new_content:
                    new_content = re.sub(r'unoptimized\s*:\s*(true|false)', 'unoptimized: true', new_content)
                else:
                    new_content = re.sub(r'(images\s*:\s*\{)', r'\1\n    unoptimized: true,', new_content)
            else:
                # Inject images block
                new_content = re.sub(
                    r'(const\s+nextConfig\s*:\s*NextConfig\s*=\s*\{)', 
                    r'\1\n  images: { unoptimized: true },', 
                    new_content, 
                    count=1
                )

        with open(old_path, 'w') as f:
            f.write(new_content)

    def get_git_branch(self):
        try:
            branch = subprocess.check_output("git rev-parse --abbrev-ref HEAD", shell=True).decode().strip()
            return branch
        except:
            return "main"

    def execute(self):
        try:
            self.validate_environment()
            self.create_backup()

            # 1. Source Migration (Folders)
            for d in SOURCE_DIRS:
                update_src = os.path.join(self.update_path, d)
                if os.path.exists(update_src):
                    Colors.log(f"Migrating folder: {d}...", "info")
                    root_dest = os.path.join(self.root_dir, d)
                    if os.path.exists(root_dest):
                        shutil.rmtree(root_dest)
                    shutil.copytree(update_src, root_dest)

            # 2. Smart Merges
            self.merge_package_json()
            self.merge_next_config()

            # 3. Overwrites
            for f in FILES_TO_OVERWRITE:
                src_f = os.path.join(self.update_path, f)
                if os.path.exists(src_f):
                    Colors.log(f"Overwriting {f}...", "info")
                    shutil.copy2(src_f, os.path.join(self.root_dir, f))

            # 4. Install & Build
            self.run_command("npm install")
            self.run_command("npm run build")

            # 5. Deployment
            if not self.skip_deploy:
                if self.auto_confirm:
                    should_deploy = True
                else:
                    resp = input(f"{Colors.WARNING}[?] Deploy to GitHub Pages? (y/N): {Colors.ENDC}")
                    should_deploy = resp.lower() == 'y'
                
                if should_deploy:
                    self.run_command("npm run deploy")
                else:
                    Colors.log("Skipping deployment.", "info")

            # 6. Cleanup
            self.cleanup(success=True)

            # 7. Git Commit
            if not self.skip_commit:
                if self.auto_confirm:
                    should_commit = True
                else:
                    resp = input(f"{Colors.WARNING}[?] Commit and push changes? (y/N): {Colors.ENDC}")
                    should_commit = resp.lower() == 'y'

                if should_commit:
                    branch = self.get_git_branch()
                    Colors.log(f"Committing to branch '{branch}'...", "info")
                    self.run_command("git add .")
                    self.run_command('git commit -m "chore: execute nextjs-synch-update protocol"')
                    self.run_command(f"git push origin {branch}")

            Colors.log("Next.js Synch-Update Protocol Completed Successfully.", "success")

        except Exception as e:
            Colors.log(f"Protocol FAILED: {str(e)}", "error")
            self.restore_backup()
            self.cleanup(success=False)
            sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automated Next.js Portfolio Synchronization & Update Tool")
    parser.add_argument("-y", "--yes", action="store_true", help="Auto-confirm all prompts")
    parser.add_argument("--no-deploy", action="store_true", help="Skip deployment step")
    parser.add_argument("--no-commit", action="store_true", help="Skip git commit/push step")
    
    args = parser.parse_args()
    
    updater = NextjsUpdater(
        auto_confirm=args.yes,
        no_deploy=args.no_deploy,
        no_commit=args.no_commit
    )
    updater.execute()
