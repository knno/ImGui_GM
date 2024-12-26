// CPP file for the ImGui extension NodeEditor
#include "../../imext/config.h"

#ifdef IMEXT_NODE_EDITOR
#include "../../imgui_gm.h"
#include "imext_node_editor.h"

node_editor::EditorContext* g_editorContext;

// Wrappers
GMFUNC(__imext_node_editor_create_editor) {
    GMOVERRIDE(CreateEditor);

	RValue* config_file = &arg[0];
    GMDEFAULT(undefined);
	GMHINT(String|Undefined);

    node_editor::Config config;
    
    if (config_file->kind == VALUE_STRING) {
        config.SettingsFile = config_file->GetString();
    }

    g_editorContext = node_editor::CreateEditor(&config);

    Result.kind = VALUE_PTR;
    Result.ptr = g_editorContext;
	GMRETURN(ImExtNodeEditorContext);
}

#endif
