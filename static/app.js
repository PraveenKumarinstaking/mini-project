/* ═══════════════════════════════════════════════════════════════
   Green Cloud Framework – Dashboard JavaScript
   Handles API calls, charts, form submission, and live updates
   ═══════════════════════════════════════════════════════════════ */

const API = {
    schedule:  '/api/schedule',
    tasks:     '/api/tasks',
    metrics:   '/api/metrics',
    dcs:       '/api/datacenters',
    timeline:  '/api/carbon-timeline',
    modelInfo: '/api/model-info',
};

// ─── Chart Instances ─────────────────────────────────────────────
let carbonChart = null;
let energyChart = null;

// ─── Chart.js Defaults ──────────────────────────────────────────
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

// ─── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadDashboard();
    initForm();
    // Auto-refresh every 30s
    setInterval(loadDashboard, 30000);
});

// ─── Load All Dashboard Data ─────────────────────────────────────
async function loadDashboard() {
    try {
        const [metrics, tasks, timeline, dcs, modelInfo] = await Promise.all([
            fetchJSON(API.metrics),
            fetchJSON(API.tasks),
            fetchJSON(API.timeline),
            fetchJSON(API.dcs),
            fetchJSON(API.modelInfo),
        ]);
        updateMetrics(metrics);
        updateHeroStats(metrics);
        updateTaskTable(tasks);
        updateCarbonChart(timeline);
        updateEnergyChart(tasks.slice(0, 10));
        updateDataCenters(dcs);
        updateModelInfo(modelInfo);
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// ─── Hero Stats ──────────────────────────────────────────────────
function updateHeroStats(m) {
    animateValue('hero-carbon-saved', m.carbon_saved);
    document.getElementById('hero-efficiency').textContent = m.efficiency_pct + '%';
    document.getElementById('hero-tasks').textContent = m.total_tasks;
}

// ─── Metric Cards ────────────────────────────────────────────────
function updateMetrics(m) {
    document.getElementById('metric-carbon-saved').textContent = m.carbon_saved + ' kg';
    document.getElementById('metric-energy').textContent = m.total_energy + ' kWh';
    document.getElementById('metric-tasks').textContent = m.total_tasks;
    document.getElementById('metric-delayed').textContent = m.tasks_delayed;

    // Animate bars
    setBars(m);
}

function setBars(m) {
    const maxTasks = Math.max(m.total_tasks, 1);
    setBar('bar-carbon', Math.min(m.efficiency_pct, 100));
    setBar('bar-energy', Math.min((m.total_energy / (maxTasks * 15)) * 100, 100));
    setBar('bar-tasks', Math.min((m.tasks_run / maxTasks) * 100, 100));
    setBar('bar-delayed', Math.min((m.tasks_delayed / maxTasks) * 100, 100));
}

function setBar(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = pct + '%';
}

// ─── Animated Counter ────────────────────────────────────────────
function animateValue(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseFloat(el.textContent) || 0;
    const duration = 800;
    const startTime = performance.now();
    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (start + (target - start) * eased).toFixed(2);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ─── Carbon Timeline Chart ──────────────────────────────────────
function initCharts() {
    const ctxCarbon = document.getElementById('carbonChart').getContext('2d');
    carbonChart = new Chart(ctxCarbon, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Carbon Intensity (gCO₂/kWh)',
                data: [],
                borderColor: '#22c55e',
                backgroundColor: createGradient(ctxCarbon, '#22c55e'),
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#22c55e',
                pointBorderColor: '#0a0e17',
                pointBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17,24,39,0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    titleFont: { weight: '600' },
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { padding: 8 }
                },
                x: {
                    grid: { display: false },
                    ticks: { padding: 8 }
                }
            }
        }
    });

    const ctxEnergy = document.getElementById('energyChart').getContext('2d');
    energyChart = new Chart(ctxEnergy, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Energy (kWh)',
                data: [],
                backgroundColor: createBarColors([]),
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 36,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17,24,39,0.95)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { padding: 8 }
                },
                x: {
                    grid: { display: false },
                    ticks: { padding: 8, maxRotation: 45 }
                }
            }
        }
    });
}

function createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    return gradient;
}

function createBarColors(data) {
    const palette = [
        'rgba(34,197,94,0.7)', 'rgba(59,130,246,0.7)',
        'rgba(139,92,246,0.7)', 'rgba(245,158,11,0.7)',
        'rgba(96,165,250,0.7)', 'rgba(74,222,128,0.7)',
        'rgba(167,139,250,0.7)', 'rgba(251,191,36,0.7)',
        'rgba(248,113,113,0.7)', 'rgba(34,211,238,0.7)',
    ];
    return data.map((_, i) => palette[i % palette.length]);
}

function updateCarbonChart(timeline) {
    carbonChart.data.labels = timeline.map(t => t.time);
    carbonChart.data.datasets[0].data = timeline.map(t => t.carbon);
    carbonChart.update('none');
}

function updateEnergyChart(tasks) {
    const labels = tasks.map(t => t.name.length > 18 ? t.name.substring(0, 18) + '…' : t.name);
    const data = tasks.map(t => t.energy_predicted);
    energyChart.data.labels = labels;
    energyChart.data.datasets[0].data = data;
    energyChart.data.datasets[0].backgroundColor = createBarColors(data);
    energyChart.update('none');
}

// ─── Data Centers ────────────────────────────────────────────────
function updateDataCenters(dcs) {
    const grid = document.getElementById('dc-grid');
    grid.innerHTML = dcs.map(dc => {
        const ciClass = dc.current_carbon < 35 ? 'low' : dc.current_carbon < 55 ? 'medium' : 'high';
        return `
            <div class="dc-card fade-in">
                <div class="dc-header">
                    <span class="dc-name">${dc.name}</span>
                    <span class="dc-status online">${dc.status}</span>
                </div>
                <div class="dc-meta">
                    <div class="dc-meta-row">
                        <span>Carbon Intensity</span>
                        <span class="dc-carbon-value ${ciClass}">${dc.current_carbon} gCO₂</span>
                    </div>
                    <div class="dc-meta-row">
                        <span>Renewable Energy</span>
                        <span style="color:#4ade80;font-weight:600">${dc.renewable_pct}%</span>
                    </div>
                    <div class="dc-meta-row">
                        <span>Region</span>
                        <span>${dc.region}</span>
                    </div>
                    <div class="dc-renewable-bar">
                        <div class="dc-renewable-fill" style="width:${dc.renewable_pct}%"></div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// ─── Task Table ──────────────────────────────────────────────────
function updateTaskTable(tasks) {
    const tbody = document.getElementById('task-tbody');
    tbody.innerHTML = tasks.map(t => {
        const badgeClass = t.status === 'delayed' ? 'badge-delayed' : 'badge-completed';
        const statusLabel = t.status.charAt(0).toUpperCase() + t.status.slice(1);
        return `
            <tr>
                <td style="color:var(--text-muted);font-family:monospace">${t.id}</td>
                <td style="color:var(--text-primary);font-weight:500">${t.name}</td>
                <td>${t.cpu_usage}%</td>
                <td>${t.memory_usage} GB</td>
                <td>${t.duration} min</td>
                <td>${t.energy_predicted}</td>
                <td>${t.carbon_emission}</td>
                <td>${t.data_center}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
            </tr>`;
    }).join('');
}

// ─── ML Model Info ───────────────────────────────────────────────
function updateModelInfo(info) {
    const card = document.getElementById('model-info-card');
    card.innerHTML = `
        <div class="model-grid">
            <div class="model-item">
                <div class="model-item-label">Algorithm</div>
                <div class="model-item-value">${info.algorithm}</div>
            </div>
            <div class="model-item">
                <div class="model-item-label">R² Score</div>
                <div class="model-item-value" style="color:var(--green-400)">${info.r2_score}</div>
            </div>
            <div class="model-item">
                <div class="model-item-label">Training Samples</div>
                <div class="model-item-value">${info.training_samples}</div>
            </div>
            <div class="model-item">
                <div class="model-item-label">CPU Coeff</div>
                <div class="model-item-value">${info.coefficients.cpu_usage}</div>
            </div>
            <div class="model-item">
                <div class="model-item-label">Memory Coeff</div>
                <div class="model-item-value">${info.coefficients.memory_usage}</div>
            </div>
            <div class="model-item">
                <div class="model-item-label">Duration Coeff</div>
                <div class="model-item-value">${info.coefficients.duration}</div>
            </div>
        </div>`;
}

// ─── Form Handling ───────────────────────────────────────────────
function initForm() {
    const slider = document.getElementById('duration');
    const sliderLabel = document.getElementById('duration-label');
    slider.addEventListener('input', () => {
        sliderLabel.textContent = slider.value + ' min';
    });

    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btn.disabled = true;

        const payload = {
            name: document.getElementById('task-name').value,
            cpu_usage: parseFloat(document.getElementById('cpu-usage').value),
            memory_usage: parseFloat(document.getElementById('memory-usage').value),
            duration: parseFloat(slider.value),
        };

        try {
            const res = await fetch(API.schedule, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            showResult(data);
            // Refresh dashboard
            await loadDashboard();
            // Reset form
            document.getElementById('task-form').reset();
            sliderLabel.textContent = '30 min';
        } catch (err) {
            showResult({ success: false, message: 'Network error: ' + err.message });
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    });
}

function showResult(data) {
    const el = document.getElementById('schedule-result');
    const isDelayed = data.task && data.task.status === 'delayed';
    el.className = 'result-toast ' + (isDelayed ? 'delayed' : 'success');
    el.style.display = 'block';

    if (data.success) {
        const t = data.task;
        el.innerHTML = `
            <strong>${isDelayed ? '🕐 Task Delayed' : '✅ Task Scheduled'}</strong><br>
            ${data.message}<br>
            <span style="opacity:.7">Energy: ${t.energy_predicted} kWh &bull; Carbon: ${t.carbon_emission} kg &bull; DC: ${t.data_center}</span>`;
    } else {
        el.innerHTML = `<strong>❌ Error:</strong> ${data.message}`;
    }

    // Auto-hide after 8s
    setTimeout(() => { el.style.display = 'none'; }, 8000);
}
