function render_navigator(workspace_dir)
{
    $.post('/api/parseDir',{workspace:workspace_dir},function(data)
    {

    });
}