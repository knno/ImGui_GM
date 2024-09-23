workspace "dll"
    configurations { "Debug", "Release" }
    architecture "universal"
    location "dll"

project "imgui_gm"
    kind "SharedLib"
    language "C++"
    cppdialect "C++14"
    targetdir "extensions/ImGui_GM/"
    defines { "GDKEXTENSION_EXPORTS", "__YYDEFINE_EXTENSION_FUNCTIONS__" }
    architecture "universal"

    files {"dll/*.h", "dll/*.cpp"}
    vpaths {
        ["Header Files"] = "**.h",
        ["Source Files"] = {"**.c", "**.cpp"},
        ["Source Files/Wrappers"] = {"dll/imgui_*_gm.cpp"}
    }

    filter "configurations:Debug"
        defines { "DEBUG" }
        symbols "On"

    filter "configurations:Release"
        defines { "NDEBUG" }
        optimize "On"

    -- Windows
    filter { "action:vs*" }
        defines "OS_Windows"

    -- Ubuntu
    filter { "action:gmake*" }
        if os.ishost("linux") then
            defines "OS_Linux"
            pic "on"
        else
            defines "OS_Mac"
        end