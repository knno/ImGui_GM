// H file for the ImGui extension NodeEditor

#ifdef IMEXT_NODE_EDITOR
#pragma once

#include "../../imgui_gm.h"

// Enums
enum Testing {
	Testing_None = 0,
    Testing_Dog = 1,
};

// Functions
#include "imgui_node_editor_funcs.h"
#include "extension/imgui_node_editor.h"

namespace ed = ax::NodeEditor;

extern ed::EditorContext* g_editorContext;

#endif
