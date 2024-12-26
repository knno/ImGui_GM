// ImGui Extensions Configuration file.
// 
//
// Syntax:
// #define IMEXT_<EXTENSION_NAME> "<relative_folder_name>"
// #define IMEXT_<EXTENSION_NAME> ["<relative_folder_name>", "<name?>", "<header?>"]
//
//     <relative_folder_name> is the folder next to this file for the extension files.
//
//     <name?> is optional. It is the name of the extension.
//        - The name is the PascalCase from the directive name.
//
//     <header?> is optional. It is the file to look for functions and enums.
//        - header is matching the first file to be found: "imext.h", "imext_<snake_case_name>" or <snake_case_name>, respectively.
// 
// Examples:
// 
// #define IMEXT_NODE_EDITOR ["imgui_node_editor", "NodeEditor", "imext_node_editor.h"]
//
//
//

#pragma once

#define IMEXT_NODE_EDITOR "imgui_node_editor"
