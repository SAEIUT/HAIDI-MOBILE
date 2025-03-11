# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```


# Revert to the Last Push State

Here are the steps to reset your local repository to the state of the last commit pushed to GitHub.

## Step 1: Save Current Changes (Optional)
<<<<<<< Updated upstream
- If you want to keep your current changes before resetting, you can save them with the following command:
=======
If you want to keep your current changes before resetting, you can save them with the following command:
>>>>>>> Stashed changes
```bash
git stash
```
This saves your changes in a "stack" that you can restore later.

<<<<<<< Updated upstream
-if you want to come back in a "stack" 
```bash
git stah pop

```



=======
>>>>>>> Stashed changes
## Step 2: Reset to the Last Push State
To revert to the state of your last push (the last commit pushed to GitHub), use the following command:
```bash
git reset --hard origin/<branch_name>
```
**Replace `<branch_name>` with the name of your current branch, e.g., `dev-mobile`.**

- `--hard`: Removes all local uncommitted changes.
- If you want to keep the modified files without deleting them, use `--soft` instead.

## Step 3: Check the Status
After resetting, check if your repository is back to the expected state by running:
```bash
git status
```

## Step 4: Restore Saved Changes (Optional)
If you saved your changes in Step 1, you can restore them with:
```bash
git stash pop
```

## Delete Untracked Files
Untracked files are not affected by the `git reset` command. To delete them as well, use:
```bash
git clean -fd
```
- `-f`: Forces the deletion of files.
- `-d`: Deletes untracked directories as well.

### Tip: Preview Before Deleting
To see which files will be deleted without performing the action, use:
```bash
git clean -fdn
```

## Warning
These commands are destructive; make sure you're ready to lose your changes before running them.
## 

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
