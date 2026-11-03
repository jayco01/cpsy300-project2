import { fetchNutritionalInsights } from './services/apiService.js';
import { renderBarChart, renderScatterPlot, renderPieChart } from './components/charts.js';
import { renderHeatmap } from './components/heatmap.js';
import { renderTopRecipesTable } from './components/table.js';

let dietsInitialized = false;

async function loadDashboardData() {
    const dietFilter = document.getElementById('dietFilter').value;
    const statusEl = document.getElementById('apiStatus');
    const execTimeEl = document.getElementById('executionTime');

    statusEl.textContent = 'Connecting...';
    statusEl.className = 'status-pill pending';

    try {
        const data = await fetchNutritionalInsights(dietFilter);

        // Update Metadata
        statusEl.textContent = '200 OK (Live)';
        statusEl.className = 'status-pill success';
        execTimeEl.textContent = `${data.metadata.execution_time_ms} ms`;
        document.getElementById('totalRecords').textContent = `${data.metadata.filtered_records} / ${data.metadata.total_records}`;
        document.getElementById('timestamp').textContent = data.metadata.timestamp;

        // Populate dropdown options once
        if (!dietsInitialized && data.available_diets) {
            const select = document.getElementById('dietFilter');
            data.available_diets.forEach(diet => {
                const opt = document.createElement('option');
                opt.value = diet;
                opt.textContent = diet.charAt(0).toUpperCase() + diet.slice(1);
                select.appendChild(opt);
            });
            dietsInitialized = true;
        }

        // Render Components
        renderBarChart('barChart', data.avg_macros);
        renderScatterPlot('scatterPlot', data.scatter_data);
        renderHeatmap('heatmap', data.correlation_matrix);
        renderPieChart('pieChart', data.diet_distribution);
        renderTopRecipesTable('topRecipesBody', data.top_recipes);

    } catch (err) {
        console.error('Failed to load dashboard:', err);
        statusEl.textContent = 'Error';
        statusEl.className = 'status-pill error';
        execTimeEl.textContent = 'Unavailable';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    document.getElementById('dietFilter').addEventListener('change', loadDashboardData);
    document.getElementById('btnFetch').addEventListener('click', loadDashboardData);
    document.getElementById('btnReset').addEventListener('click', () => {
        document.getElementById('dietFilter').value = 'all';
        loadDashboardData();
    });
});