# Build

## Prerequisites

- Visual Studio
- Node

## Steps

### Add Extensions

1. Add git submodule of your extension
```bash
cd dll/thirdparty/
git submodule add <repo>
cd ../../
```
2. Modify `dll/imext/config.h`

### Prepare VS Project

1. Copy files of submodules, add your modifications.
```bash
cd dll/
./copy_dependencies.bat
cd ..
```
2. `premake5 vs2022`
3. Open `dll/dll.sln` and build DLL.
  - Optional: `node tools/brief/main.js` to run toolchain only.
5. Open ImGui_GM.yyp in GameMaker.
> You can rebuild solution and reload in GameMaker project

## Folder Structure
- dll/
  - [`main.cpp`](https://github.com/knno/ImGui_GM/blob/main/dll/main.cpp) for DLL initialization & IO/rendering logic
  - `gm/imgui_*_gm.cpp` for wrapped ImGui --> GM definitions
  - `imext/config.h` for extensions definition
  - `imext/*/` for ImGui extensions
    - `extension/` for ImGui extension dependencies
    - `*_gm.cpp` wrappers
- scripts/
  - ImGui/
    - [`ImGui.gml`](https://github.com/knno/ImGui_GM/blob/main/scripts/ImGui/ImGui.gml) for ImGui static functions & internal IO/events
  - ImGui_Misc/
    - [`ImGui_Misc.gml`](https://github.com/knno/ImGui_GM/blob/main/scripts/ImGui_Misc/ImGui_Misc.gml) for classes and enum definitions and misc ImGui --> GM mapping 
  - ImGui<ExtensionName>/
    - `ImGui<ExtensionName>.gml` for your ImGui extensions static functions and enums
- tools/
  - [`brief/Program.js`](https://github.com/knno/ImGui_GM/blob/main/tools/brief/Program.js) for ImGui to GM binding generation

## Building Notes

- Upon building inside of Visual Studio, the `tools/brief/main.js` script will be called. This script collects any `.cpp` files ending in "`_gm.cpp`" (*Any uses of `GMFUNC` outside of files ending in `_gm.cpp` **will not** be read*) and parses out functions defined using the `GMFUNC` macro. These parsed functions are then added to the `extensions/ImGui_GM/ImGui_GM.yy` file and static methods are created in the `@section Binds` section of the `scripts/ImGui/ImGui.gml` file automatically. You can use the various macros to define attributes for wrapped functions and their arguments. See [`brief/Wrapper.js`](https://github.com/knno/ImGui_GM/blob/main/tools/brief/Wrapper.js)'s `modifier` method for how various attributes are handled.

- To build without any extensions:
  - Remove `dll/imext/config.h` extension definitions
  - Modify premake5.lua (remove extensions filters)
  - Run `premake5 vs2022`
  - Use `NAME=vanilla` when making the package.yymps

- Bundling the package requires the bundle.json file specified as environment variable:
  ```bash
  NAME=bundle node tools/bundle/main.js
  NAME=vanilla node tools/bundle/main.js # For no extensions build
  ```
---