export function renderHeatmap(containerId, correlationData) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const cols = correlationData.columns;
    const values = correlationData.values;

    const table = document.createElement('table');
    table.className = 'heatmap-table';

    // Header
    const thead = document.createElement('tr');
    thead.innerHTML = '<th></th>' + cols.map(c => `<th>${c.split('(')[0]}</th>`).join('');
    table.appendChild(thead);

    // Rows
    cols.forEach((rowName, rIdx) => {
        const tr = document.createElement('tr');
        let rowHtml = `<td style="font-weight:600; text-align:left;">${rowName.split('(')[0]}</td>`;

        cols.forEach((colName, cIdx) => {
            const val = values[rIdx][cIdx];
            const alpha = Math.max(0.12, Math.abs(val));
            const bg = `rgba(239, 68, 68, ${alpha})`;
            const textColor = val > 0.6 ? '#ffffff' : '#0f172a';
            rowHtml += `<td style="background-color:${bg}; color:${textColor}; font-weight:700;">${val.toFixed(2)}</td>`;
        });

        tr.innerHTML = rowHtml;
        table.appendChild(tr);
    });

    container.appendChild(table);
}