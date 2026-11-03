let barChartInstance = null;
let scatterChartInstance = null;
let pieChartInstance = null;

export function renderBarChart(canvasId, avgMacros) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (barChartInstance) barChartInstance.destroy();

    const labels = avgMacros.map(d => d.Diet_type.toUpperCase());
    const protein = avgMacros.map(d => d["Protein(g)"]);
    const carbs = avgMacros.map(d => d["Carbs(g)"]);
    const fat = avgMacros.map(d => d["Fat(g)"]);

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Protein (g)', data: protein, backgroundColor: '#2563eb' },
                { label: 'Carbs (g)', data: carbs, backgroundColor: '#10b981' },
                { label: 'Fat (g)', data: fat, backgroundColor: '#f59e0b' }
            ]
        },
        options: {
        responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { boxWidth: 10 } } }
        }
    });
}

export function renderScatterPlot(canvasId, scatterData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (scatterChartInstance) scatterChartInstance.destroy();

    const points = scatterData.map(item => ({
        x: item["Protein(g)"],
        y: item["Carbs(g)"],
        recipe: item.Recipe_name
    }));

    scatterChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Recipes',
                data: points,
                backgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.raw.recipe}: (${ctx.raw.x}g P, ${ctx.raw.y}g C)`
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Protein (g)' } },
                y: { title: { display: true, text: 'Carbs (g)' } }
            }
        }
    });
}

export function renderPieChart(canvasId, dietDistribution) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();

    const labels = Object.keys(dietDistribution).map(l => l.toUpperCase());
    const values = Object.values(dietDistribution);

    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } }
        }
    });
}