using TodoApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// הגדרת ה-DB Context (ללא שינוי מהותי)
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("ToDoDB"),
        new MySqlServerVersion(new Version(8, 0, 44)) // גרסת MySQL שלך
    )
);

// ===========================================
// ✅ 1. תיקון CORS: הגדרת מדיניות עם שם (RenderPolicy)
// ===========================================
builder.Services.AddCors(options =>
{
    // משתמשים ב-AddPolicy ונותנים שם: "RenderPolicy"
    options.AddPolicy(name: "RenderPolicy", policy => 
    {
        // כתובת ה-React המדויקת שלך ב-Render
        policy.WithOrigins("https://todolistreact-master-t5tk.onrender.com")
              .AllowAnyHeader()    // מאפשר כל כותר
              .AllowAnyMethod();   // מאפשר כל HTTP method
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===========================================
// ✅ 2. תיקון CORS: הפעלת המדיניות עם השם
// ===========================================
app.UseCors("RenderPolicy"); // קריאה מפורשת למדיניות "RenderPolicy"

var itemsApi = app.MapGroup("/items");

app.MapGet("/", () => "API is running!");

// ===========================================
// GET /items/{id} – שליפת משימה לפי Id
// ===========================================
itemsApi.MapGet("/{id:int}", async ([FromServices] ToDoDbContext context, int id) =>
{
    var item = await context.Items.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
    return item is null ? Results.NotFound() : Results.Ok(item);
})
.WithName("GetItemById");

// ===========================================
// GET /items – שליפת כל המשימות
// ===========================================
itemsApi.MapGet("/", async ([FromServices] ToDoDbContext context) =>
{
    return await context.Items.ToListAsync();
})
.WithName("GetAllItems");

// ===========================================
// POST /items – הוספת משימה חדשה
// ===========================================
itemsApi.MapPost("/", async ([FromServices] ToDoDbContext context,
                            [FromServices] LinkGenerator linker,
                            [FromBody] Item item) =>
{
    context.Items.Add(item);
    await context.SaveChangesAsync();

    var itemUrl = linker.GetPathByName("GetItemById", new { id = item.Id });
    return Results.Created(itemUrl, item);
})
.WithName("CreateItem");

// ===========================================
// PUT /items/{id} – עדכון משימה
// ===========================================
itemsApi.MapPut("/{id:int}", async ([FromServices] ToDoDbContext context, int id, [FromBody] Item updatedItem) =>
{
    var itemToUpdate = await context.Items.FindAsync(id);

    if (itemToUpdate == null)
        return Results.NotFound();

    itemToUpdate.Name = updatedItem.Name;
    itemToUpdate.IsComplete = updatedItem.IsComplete;

    await context.SaveChangesAsync();

    return Results.NoContent();
})
.WithName("UpdateItem");

// ===========================================
// DELETE /items/{id} – מחיקת משימה
// ===========================================
itemsApi.MapDelete("/{id:int}", async ([FromServices] ToDoDbContext context, int id) =>
{
    var itemToDelete = await context.Items.FindAsync(id);

    if (itemToDelete == null)
        return Results.NotFound();

    context.Items.Remove(itemToDelete);
    await context.SaveChangesAsync();

    return Results.NoContent();
})
.WithName("DeleteItem");

app.Run();
