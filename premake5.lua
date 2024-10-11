workspace "dll"
    configurations { "Debug", "Release" }
    location "dll"
    platforms { "x64", }

    filter { "platforms:x64" }
        system "windows"
        architecture "x64"

project "imgui_gm"
    kind "SharedLib"
    language "C++"
    cppdialect "C++14"
    targetdir "extensions/ImGui_GM/"
    defines { "GDKEXTENSION_EXPORTS", "__YYDEFINE_EXTENSION_FUNCTIONS__" }

    includedirs { "dll", "dll/imgui" }

    files {
        "dll/*.h",
        "dll/*.cpp",
        "dll/imgui/*.h",
        "dll/imgui/*.cpp",
        "dll/gm/*.h",
        "dll/gm/*.cpp",
        "dll/imext/config.h",
        -- Extensions
        -- "dll/imext/*/**.cpp",
        -- "dll/imext/*/**.inl",
        -- "dll/imext/*/**.h",
    }
    vpaths {
        ["Configs"] = {"dll/imext/config.h", },

        ["Wrapper/Base"] = {"dll/gm/*_gm.cpp", },
        ["ImGui/GM"] = {"dll/gm/**.h", "dll/gm/**.c", "dll/gm/**.cpp", },
        ["ImGui/Internal"] = {
            "dll/imgui/**.h", "dll/imgui/**.c", "dll/imgui/**.cpp",
        },
        ["ImGui"] = {
            "dll/imgui_gm.h", "dll/imgui_gm.cpp",
            "dll/imgui_impl_gm.h", "dll/imgui_impl_gm.cpp",
        },

        ["Wrapper/*"] = {"dll/imext/**/*_gm.cpp", },

        ["Class/Base"] = {"dll/imgui_gm_*.h", },
        ["Class/*"] = {"dll/imext/**/imext_gm_*.h", },

        ["ImExt/*"] = {"dll/imext/**/**.h", "dll/imext/**/**.c", "dll/imext/**/**.cpp", "dll/imext/**/**.inl", },
    }

    filter "configurations:Debug"
        defines { "DEBUG" }
        symbols "On"
        postbuildcommands { "node ../tools/brief/main.js" }

    filter "configurations:Release"
        defines { "NDEBUG" }
        optimize "On"
        postbuildcommands { "node ../tools/brief/main.js" }

    -- Windows
    filter { "action:vs*" }
        defines "OS_Windows"

    -- Ubuntu
    filter { "action:gmake*" }
        if _OPTIONS["os"] == "linux" or os.ishost("linux") then
            defines "OS_Linux"
            pic "on"
            targetextension ".so"
            buildoptions { "-shared", "-Werror" }
        else
            defines "OS_Mac"
        end
