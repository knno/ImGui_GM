# ImGui_GM
A (somewhat) Windows only ImGui wrapper for modern GameMaker
![image](https://user-images.githubusercontent.com/6483989/215343506-9b6900b0-6c0b-4f0e-a96f-f0e3561a97a0.png)

# Release
**The [itch.io page](https://nommiiin.itch.io/imgui-gm) has pre-built *Windows* packages for GameMaker**

# Usage (GameMaker)
***⚠️ HEADS UP: Ensure you're using a compatible runtime, see Compatibility heading below for more info***

0. Import build of ImGui_GM locally or download it from the [itch.io](https://nommiiin.itch.io/imgui-gm) page
1. Create a persistent object and call the following functions in their respective events:
  - `ImGui.__Initialize()` in the create event
  - `ImGui.__Update()` in any updating event (suggested: Begin Step)
  - `ImGui.__Render()` in any rendering event (suggested: Draw GUI)
  
2. Create an instance of the object at the start of your game, then call `ImGui.Begin` and `ImGui.End` in the step event to draw. Below is example GML for how to use the library.

```gml
ImGui.ShowAboutWindow();

if (ImGui.Begin("Test Window")) {
	ImGui.Text("Hello World :3");
	str = ImGui.InputText("An Input", str);
	
	if (ImGui.Button("Press Me")) {
		show_message(string("your input was: {0}", str));	
	}
	
	ImGui.End();
}
```

3. See **Coverage** heading below or the ImGui script in project for ImGui -> GML wrappers

# Coverage
Pretty much everything is covered! Check out [COVERAGE.MD](https://github.com/nommiin/ImGui_GM/blob/main/COVERAGE.md) to see a list of wrapped functions along with non-standard ImGui_GM-only functions! [The wiki](https://github.com/nommiin/ImGui_GM/wiki) also includes some info on some differences and how to use various ImGui features in GML. 

# Reference
- dll/
  - [`main.cpp`](https://github.com/nommiin/ImGui_GM/blob/main/dll/main.cpp) for DLL initialization & game loop hook-ins
  - [`imgui_gm.h`](https://github.com/nommiin/ImGui_GM/blob/main/dll/imgui_gm.h) for some configuration like `IMGUIGM_NATIVE`
  - [`imgui_*_gm.cpp`](https://github.com/nommiin/ImGui_GM/blob/main/dll/imgui_api_gm.cpp) for wrapped ImGui->GM definitions
  - [`imgui_impl_gm.cpp`](https://github.com/nommiin/ImGui_GM/blob/main/dll/imgui_impl_gm.cpp) for GM backend, includes (currently unusued) GML rendering logic 
- scripts/
    - [`ImGui/ImGui.gml`](https://github.com/nommiin/ImGui_GM/blob/main/scripts/ImGui/ImGui.gml) for ImGui static functions, enum definitions, and internal IO/events
    - [`ImGui_Misc/ImGui_Misc.gml`](https://github.com/nommiin/ImGui_GM/blob/main/scripts/ImGui_Misc/ImGui_Misc.gml) for input mapping & helper classes 
- shaders/
  - [`shdImGui/shdImGui.fsh`](https://github.com/nommiin/ImGui_GM/blob/main/shaders/shdImGui/shdImGui.fsh) for clip-rect shader used by GML renderer
- tools/
  - [`brief/Program.js`](https://github.com/nommiin/ImGui_GM/blob/main/tools/brief/Program.js) for ImGui to GM binding generation

# Building
*Using C++20, Windows SDK v10.0, Node.js v16.18.0, built with Visual Studio Community 2022*

1. Run `copy_dependencies.bat` to copy required `.cpp` and `.h` files from `thirdparty/*` into `dll/`
2. Open `dll.sln` in Visual Studio (support for versions older than 2022 is unknown)
3. Build for x64, resulting `imgui_gm.dll` file should be automatically copied to `../extensions/ImGui_GM/imgui_gm.dll` and wrapped functions should be generated by `brief/main.js` in `ImGui_GM.yyp`
4. Open `ImGui_GM.yyp` and create a local package containing `ImGui_GM` (extension), `ImGui` (script), and `ImGui_Misc` (script)
5. Import local package into your game and create a controller object that calls `ImGui.__Initialize()` once, `ImGui.__Update()` every frame, and `ImGui.__Render()` in a draw event

# Toolchain
I'm not sure if *toolchain* is the correct term here, but it sounds cool so I'll run with it. Here are some extra words on how the extension building works.

- Upon building inside of Visual Studio, the `tools/brief/main.js` script will be called. This scripts reads `imgui.h` to collect IMGUI_API forward declarations for `COVERAGE.MD` and enums for GML, it also collects any `.cpp` files ending in "`_gm.cpp`" (*Any uses of `GMFUNC` outside of files ending in `_gm.cpp` **will not** be read*) and parses out functions defined using the `GMFUNC` macro. These parsed functions are then added to the `extensions/ImGui_GM/ImGui_GM.yy` file and static methods are created in the `@section Binds` section of the `scripts/ImGui/ImGui.gml` file automatically. Enums from ImGui are also defined in the `@section Enums` section. You can use the various preprocessor definition to hint attributes for wrapped functions and their arguments. See [`brief/Wrapper.js`](https://github.com/nommiin/ImGui_GM/blob/main/tools/brief/Wrapper.js#L96)'s `modifier` method for how various attributes are handled. 

# Compatibility
### Platform
Whilst this extension uses native DX11 APIs to render ImGui's draw data directly, there is support for rendering ImGui using vertex buffers via the [`IMGUIGM_NATIVE`](https://github.com/nommiin/ImGui_GM/blob/main/dll/imgui_gm.h#L13) preprocessor definition. If it is set to false, all DX11 rendering will be skipped and `ImDrawData` will get copied into an internal buffer, then rendered as vertex buffers. This is mostly functional but currently, sprite indexes will be ignored (0 is used) and surface textures are unsupported.

### Runtime
This extension makes extensive use of the changed `static` behavior in beta runtime v2023.100.0.264 and onward. Be sure to use a runtime that has these changes in them, otherwise usage may not work as expected. If you're unsure about if your runtime supports these new behaviours or not, check if the `static_get` function exists; if so, you're good! Otherwise, you'll likely need to upgrade (or switch to [the beta](https://gms.yoyogames.com/release-notes-runtime-NuBeta.html)). As a good rule of thumb, it's best to assume this project will be using the latest beta release of GameMaker. You can also check the .yyp file's metadata for an IDE version.

At the time of writing, the aforementioned changes to `static` are only avaliable on the beta branch of GameMaker; using stable builds currently unsupported

*Last Updated: 1/29/2023*

# Notes
- Functions like `ImGui.Begin` may not return what you expect, see ["ImGuiReturnMask Usage"](https://github.com/nommiin/ImGui_GM/wiki/ImGuiReturnMask-Usage) for more info

- Functions that accept an array of items as an argument (such as `ImGui.DragInt3`, `ImGui.SliderFloat2`, etc) will ***directly modify*** the given array. Keep this in mind when using them. Analogous functions that accept single elements (such as `ImGui.DrawInt`, `ImGui.SliderFloat`) ***will not*** make any changes directly to the value, and the return value should be used.

- Like the above, `ColorEdit4` and `ColorPicker4` take the GML class `ImColor` (or any struct) and mutates it directly; this is worth mentioning as `ColorEdit3` returns a BGR colour

- Honestly, I dunno the difference between a "wrapper" and a "bind", so you'll probably see the two terms are used interchangably

# Special Thanks
- [Omar Cornut](https://github.com/ocornut/) for creating [Dear ImGui](https://github.com/ocornut/imgui)
- [rousr](https://rou.sr/) for creating [ImGuiGML](https://imguigml.rou.sr/) which inspired development of this
- [@nkrapivin](https://github.com/nkrapivin) for providing general assistance with `YYRunnerInterface` magic
- [@kraifpatrik](https://github.com/blueburncz/GMD3D11)'s GMD3D11 for serving as reference on how to retrieve textures from GameMaker
