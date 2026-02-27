
## Running Batch Files (.bat)

Claude Code runs in a bash shell which cannot execute `.bat` files directly.
Use PowerShell with `cmd /c` to run them.

### Build commands

Release build + upload:
```bash
powershell -Command "cmd /c 'D:\GIT\BenjaminKobjolke\android\android_folder_gallery\tools\build_and_upload_android.bat'"
```

Debug build + upload:
```bash
powershell -Command "cmd /c 'D:\GIT\BenjaminKobjolke\android\android_folder_gallery\tools\build_and_upload_android.bat debug'"
```

Use `timeout: 600000` (10 minutes) for build commands.

### General pattern

```bash
powershell -Command "cmd /c 'D:\GIT\BenjaminKobjolke\android\android_folder_gallery\tools\script.bat'"
```

For scripts with parameters:
```bash
powershell -Command "cmd /c 'D:\GIT\BenjaminKobjolke\android\android_folder_gallery\tools\script.bat param1'"
```
