// CPP file for the ImGui extension NodeEditor

#ifdef IMEXT_NODE_EDITOR
#include "../../imgui_gm.h"
#include "imext_node_editor.h"
#include "extension/imgui_node_editor.cpp"

ed::EditorContext* g_editorContext;

// Wrappers
GMFUNC(__imext_node_editor_create_editor) {
    GMOVERRIDE(CreateEditor);

	RValue* config_file = &arg[0];
    GMDEFAULT(undefined);
	GMHINT(String|Undefined);

    ed::Config config;
    
    if (config_file->kind == VALUE_STRING) {
        config.SettingsFile = config_file->GetString();
    }

    g_editorContext = ed::CreateEditor(&config);

    Result.kind = VALUE_PTR;
    Result.ptr = g_editorContext;
	GMRETURN(ImExtNodeEditorContext);
}

#endif
