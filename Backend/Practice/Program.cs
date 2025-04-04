using Practice.Models;
using Practice.Controllers;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Swagger;
using Microsoft.OpenApi.Models;
using Practice.Helpers;
using Practice.Configuration;
using Swashbuckle.AspNetCore.Annotations;
using Practice.Services;

var builder = WebApplication.CreateBuilder(args);

// Connect to db
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add services
builder.Services.AddControllers();
builder.Services.AddSwaggerGen(c =>
{
    c.EnableAnnotations();
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Products API",
        Version = "v1",
        Description = "API for product management"
    });
    c.UseInlineDefinitionsForEnums();
    c.SchemaGeneratorOptions.UseInlineDefinitionsForEnums = true;
    c.SchemaGeneratorOptions.UseAllOfForInheritance = true;
});

builder.Services.AddTransient<DockerService>();
// ����������� FileManager
builder.Services.AddTransient<FileManager>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Release"))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    });
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();


app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync("wwwroot/index.html");
});

app.Run();
