// H file for the ImGui extension NodeEditor
#include "../../imext/config.h"

#ifdef IMEXT_NODE_EDITOR
#pragma once

#include "extension/imgui_node_editor.h"

// Enums

// Functions

namespace node_editor = ax::NodeEditor;

extern node_editor::EditorContext* g_editorContext;

#endif
