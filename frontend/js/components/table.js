export function renderTopRecipesTable(tbodyId, recipes) {
    const tbody = document.getElementById(tbodyId);
    if (!recipes || recipes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No recipes found</td></tr>';
        return;
    }

    tbody.innerHTML = recipes.map(r => `                                                                                                                                                   
        <tr>                                                                                                                                                                               
            <td style="font-weight:600;">${r.Recipe_name}</td>                                                                                                                             
            <td><span class="diet-pill">${r.Diet_type}</span></td>                                                                                                                         
            <td style="text-align:right; font-weight:700; color:#2563eb;">${r["Protein(g)"]}</td>                                                                                          
            <td style="text-align:right; color:#10b981;">${r["Carbs(g)"]}</td>                                                                                                             
            <td style="text-align:right; color:#f59e0b;">${r["Fat(g)"]}</td>                                                                                                               
        </tr>                                                                                                                                                                              
    `).join('');
}