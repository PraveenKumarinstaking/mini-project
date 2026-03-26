/**
 * Green Cloud Framework – Frontend Logic
 * Handles real-time updates, charts, and API interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    const elements = {
        cpuSlider: document.getElementById('task-cpu'),
        memSlider: document.getElementById('task-mem'),
        cpuVal: document.getElementById('cpu-val'),
        memVal: document.getElementById('mem-val'),
        taskForm: document.getElementById('task-form'),
        submitBtn: document.getElementById('submit-btn'),
        formResult: document.getElementById('form-result'),
        dcContainer: document.getElementById('dc-container'),
        taskBody: document.getElementById('task-body'),
        modelInfo: document.getElementById('model-info'),
        stats: {
            carbonSaved: document.getElementById('stat-carbon-saved'),
            efficiency: document.getElementById('stat-efficiency'),
            totalCarbon: document.getElementById('metric-total-carbon'),
            totalEnergy: document.getElementById('metric-total-energy'),
            totalTasks: document.getElementById('metric-total-tasks'),
            avgIntensity: document.getElementById('metric-avg-intensity')
        }
    };

    let carbonChart = null;

    // --- Initial Setup ---
    initSliders();
    initCharts();
    updateDashboard();
    
    // Refresh loop (metrics & data centers)
    setInterval(updateDashboard, 5000);

    // --- Helper Functions ---

    function initSliders() {
        elements.cpuSlider.addEventListener('input', (e) => {
            elements.cpuVal.innerText = `${e.target.value}%`;
        });
        elements.memSlider.addEventListener('input', (e) => {
            elements.memVal.innerText = `${e.target.value} GB`;
        });
    }

    async function initCharts() {
        const ctx = document.getElementById('carbon-chart').getContext('2d');
        carbonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Carbon Intensity (g/kWh)',
                    data: [],
                    borderColor: '#4ade80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#22c55e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    async function updateDashboard() {
        try {
            const [metrics, dcs, timeline, model] = await Promise.all([
                fetch('/api/metrics').then(r => r.json()),
                fetch('/api/datacenters').then(r => r.json()),
                fetch('/api/carbon-timeline').then(r => r.json()),
                fetch('/api/model-info').then(r => r.json())
            ]);

            // Update Metrics
            elements.stats.carbonSaved.innerText = metrics.carbon_saved.toFixed(2);
            elements.stats.efficiency.innerText = `${metrics.efficiency_pct}%`;
            elements.stats.totalCarbon.innerText = metrics.total_carbon.toFixed(3);
            elements.stats.totalEnergy.innerText = metrics.total_energy.toFixed(2);
            elements.stats.totalTasks.innerText = metrics.total_tasks;
            elements.stats.avgIntensity.innerText = metrics.avg_carbon_intensity;

            // Update Data Centers
            elements.dcContainer.innerHTML = dcs.map(dc => `
                <div class="dc-card fade-in">
                    <div class="dc-header">
                        <span class="dc-name">${dc.name}</span>
                        <span class="dc-status online">Online</span>
                    </div>
                    <div class="dc-meta">
                        <div class="dc-meta-row">
                            <span>Carbon Intensity</span>
                            <span class="dc-carbon-value ${getCarbonClass(dc.current_carbon)}">${dc.current_carbon}</span>
                        </div>
                        <div class="dc-meta-row">
                            <span>Renewable Energy</span>
                            <span>${dc.renewable_pct}%</span>
                        </div>
                    </div>
                    <div class="dc-renewable-bar">
                        <div class="dc-renewable-fill" style="width: ${dc.renewable_pct}%"></div>
                    </div>
                </div>
            `).join('');

            // Update Chart
            carbonChart.data.labels = timeline.map(t => t.time);
            carbonChart.data.datasets[0].data = timeline.map(t => t.carbon);
            carbonChart.update('none');

            // Update Model Info
            elements.modelInfo.innerHTML = `
                <div class="model-item">
                    <div class="model-item-label">Algorithm</div>
                    <div class="model-item-value">${model.algorithm}</div>
                </div>
                <div class="model-item">
                    <div class="model-item-label">Model Accuracy (R²)</div>
                    <div class="model-item-value">${model.r2_score}</div>
                </div>
                <div class="model-item">
                    <div class="model-item-label">Samples Trained</div>
                    <div class="model-item-value">${model.training_samples}</div>
                </div>
            `;

            // Refresh Task History
            const history = await fetch('/api/tasks').then(r => r.json());
            elements.taskBody.innerHTML = history.map(t => `
                <tr>
                    <td><code>${t.id}</code></td>
                    <td>${t.name}</td>
                    <td>${t.energy_predicted.toFixed(3)}</td>
                    <td><span class="badge ${getCarbonClass(t.carbon_intensity)}">${t.carbon_intensity}</span></td>
                    <td>${t.carbon_emission.toFixed(4)}</td>
                    <td>${t.data_center}</td>
                    <td><span class="badge badge-${t.status}">${t.status}</span></td>
                    <td>${new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                </tr>
            `).join('');

        } catch (err) {
            console.error('Dashboard Update Failed:', err);
        }
    }

    function getCarbonClass(ci) {
        if (ci < 35) return 'low';
        if (ci < 60) return 'medium';
        return 'high';
    }

    // --- Form Submission ---
    elements.taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            name: document.getElementById('task-name').value,
            cpu_usage: parseFloat(elements.cpuSlider.value),
            memory_usage: parseFloat(elements.memSlider.value),
            duration: parseFloat(document.getElementById('task-duration').value)
        };

        elements.submitBtn.disabled = true;
        elements.submitBtn.innerText = 'Analyzing Carbon Impact...';

        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.success) {
                showResult(result.message, result.task.decision === 'Run Now' ? 'success' : 'delayed');
                updateDashboard();
                elements.taskForm.reset();
                elements.cpuVal.innerText = '50%';
                elements.memVal.innerText = '8 GB';
            }
        } catch (err) {
            showResult('Scheduling Failed. Please check connectivity.', 'delayed');
        } finally {
            elements.submitBtn.disabled = false;
            elements.submitBtn.innerText = 'Schedule Task';
        }
    });

    function showResult(text, type) {
        elements.formResult.innerText = text;
        elements.formResult.className = `result-toast ${type}`;
        elements.formResult.style.display = 'block';
        setTimeout(() => {
            elements.formResult.style.display = 'none';
        }, 8000);
    }
});
