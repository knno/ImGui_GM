# ImGui_GM

ImGui wrapper for modern GameMaker.

![issues](https://badgen.net/github/open-issues/knno/imgui_gm)
![coverage](https://badgen.net/https/raw.githubusercontent.com/knno/imgui_gm/main/extra/badges/coverage.json?icon=awesome)

Check the [Wiki](https://github.com/knno/imgui_gm/wiki) for more info!

# Features
- Latest ImGui version
- Great workflow for development
  - Easily write wrappers for your desired ImGui extensions.
  - Generate reports automatically on building.
- Example included

# Installation

- Download the pre-built Windows packages for GameMaker from [Releases](https://github.com/knno/imgui_gm/releases).
- Or you can [build](#building) the source code! See below.

# Usage (GameMaker)

There are various ways to use the **ImGui_GM** extension. Below we will see the basic and advance usage of ImGui_GM.

## Prerequisites

1. Import ImGui_GM.yymps

## Basic Usage

1. Create a persistent object and call the essential functions in their respective events.
  - `ImGui.__Initialize()` in the create event
  - `ImGui.__NewFrame()` in any stepping event (suggested: *Begin Step*)
  - `ImGui.__EndFrame()` in any stepping event (suggested: *End Step* + *Room End*)
  - `ImGui.__Render()` in any rendering event (suggested: *Draw*)
  - `ImGui.__Draw()` in any draw event (suggested: *Draw GUI*)
  - `ImGui.__Shutdown()` in game end event

2. Write your UI code anywhere, make sure it is executed after `__NewFrame` and before `__EndFrame` calls.
  - Using the suggested *Begin Step* and *End Step* events makes it easier for UI code to be anywhere in *Step* events of objects.

3. Make sure you have read and understood the [Notes](#notes) section.

---

## Advanced Usage

- [Window and States](https://github.com/knno/ImGui_GM/wiki/Usage-Advanced)
- [Global Flags](https://github.com/knno/ImGui_GM/wiki/Usage-GFlags)

---

# Compatibility

## Platform
Currently, this extension makes heavy usage of the ability to pass a device handler and context to extensions... unfortunately, this functionality **is only avaliable for [DX11 targets](https://manual.yoyogames.com/index.htm#t=GameMaker_Language%2FGML_Reference%2FOS_And_Compiler%2Fos_get_info.htm)**.

---

# Building

## Prerequisites

1. `npm install`

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

---

# Coverage
Check out [`ImGui_GM.gml`](https://github.com/knno/ImGui_GM/blob/main/scripts/ImGui/ImGui.gml) to view all wrapper functions.
Check out [`COVERAGE.md`](https://github.com/knno/ImGui_GM/blob/main/COVERAGE.md) for coverage report.

If there is anything missing, submit issues in this repository: [Click here to create an issue](https://github.com/knno/ImGui_GM/issues). 

# Notes
- Functions like `ImGui.Begin` may not return what you expect, see ["ImGuiReturnMask Usage"](https://github.com/knno/ImGui_GM/wiki/Usage-ImGuiReturnMask) for more info

- Functions that accept an **array** of items as an argument (such as `ImGui.DragInt3`, `ImGui.SliderFloat2`, etc) will ***directly modify*** the given array. Keep this in mind when using them. Analogous functions that accept single elements (such as `ImGui.DrawInt`, `ImGui.SliderFloat`) ***will not*** make any changes directly to the value, and the return value should be used.

- Like the above, `ColorEdit4` and `ColorPicker4` take the GML class `ImColor` and mutates it directly; this is worth mentioning as `ColorEdit3` returns a BGR colour

# Special Thanks
- [Omar Cornut](https://github.com/ocornut/) for creating [Dear ImGui](https://github.com/ocornut/imgui)
- [rousr](https://rou.sr/) for creating [ImGuiGML](https://imguigml.rou.sr/) which inspired development of this
- [@nkrapivin](https://github.com/nkrapivin) for providing general assistance with `YYRunnerInterface` magic
- [@kraifpatrik](https://github.com/blueburncz/GMD3D11)'s GMD3D11 for serving as reference on how to retrieve textures from GameMaker
- [@nommiin](https://github.com/nommiin/ImGui_GM)'s ImGui_GM original project
