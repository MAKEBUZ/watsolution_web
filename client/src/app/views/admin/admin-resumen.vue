<template>
  <div class="p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h3 class="font-weight-bold mb-1">Resumen Ejecutivo</h3>
        <div class="text-muted small d-flex align-items-center">
          <font-awesome-icon icon="calendar" class="mr-1" />
          Periodo actual:
          <span class="text-primary font-weight-600 ml-1">{{ currentMonth }}</span>
        </div>
      </div>
      <div class="d-flex">
        <button class="btn btn-outline-secondary btn-sm mr-2">
          <font-awesome-icon icon="filter" class="mr-1" /> Filtros
        </button>
        <button class="btn btn-primary btn-sm">
          <font-awesome-icon icon="download" class="mr-1" /> Descargar Reporte
        </button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div v-if="isFetching" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>
    <div v-else class="row mb-4">
      <!-- Usuarios Activos -->
      <div class="col-md-3 mb-3">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="stat-icon-wrap stat-icon-blue mb-3">
              <font-awesome-icon icon="users" class="text-primary" />
            </div>
            <div class="text-muted small mb-1">Usuarios Activos</div>
            <div class="stat-num">{{ (stats?.activeUsers ?? 0).toLocaleString('es-CO') }}</div>
            <div class="mt-1">
              <small class="text-success font-weight-600">
                <font-awesome-icon icon="arrow-up" /> +12.5%
              </small>
            </div>
            <div class="text-muted mt-1" style="font-size:0.7rem;">Suscriptores con servicio activo</div>
          </div>
        </div>
      </div>

      <!-- Recaudo Mensual -->
      <div class="col-md-3 mb-3">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="stat-icon-wrap stat-icon-green mb-3">
              <font-awesome-icon icon="dollar-sign" class="text-success" />
            </div>
            <div class="text-muted small mb-1">Recaudo Mensual</div>
            <div class="stat-num">{{ formatCurrency(stats?.monthlyRevenue ?? 0) }}</div>
            <div class="mt-1">
              <small class="text-success font-weight-600">
                <font-awesome-icon icon="arrow-up" /> +8.2%
              </small>
            </div>
            <div class="text-muted mt-1" style="font-size:0.7rem;">Total recaudado este mes</div>
          </div>
        </div>
      </div>

      <!-- Consumo Total -->
      <div class="col-md-3 mb-3">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="stat-icon-wrap stat-icon-teal mb-3">
              <font-awesome-icon icon="tint" class="text-info" />
            </div>
            <div class="text-muted small mb-1">Consumo Total</div>
            <div class="stat-num">{{ (stats?.totalConsumption ?? 0).toLocaleString('es-CO') }}</div>
            <div class="stat-unit">m³</div>
            <div class="mt-1">
              <small class="text-danger font-weight-600">
                <font-awesome-icon icon="arrow-down" /> -2.4%
              </small>
            </div>
            <div class="text-muted mt-1" style="font-size:0.7rem;">Promedio de consumo por sector</div>
          </div>
        </div>
      </div>

      <!-- Eficiencia Operacional -->
      <div class="col-md-3 mb-3">
        <div class="card stat-card h-100">
          <div class="card-body">
            <div class="stat-icon-wrap stat-icon-orange mb-3">
              <font-awesome-icon icon="chart-line" class="text-warning" />
            </div>
            <div class="text-muted small mb-1">Eficiencia Op.</div>
            <div class="stat-num">{{ stats?.efficiency ?? 98.2 }}%</div>
            <div class="mt-1">
              <small class="text-success font-weight-600">
                <font-awesome-icon icon="arrow-up" /> +0.5%
              </small>
            </div>
            <div class="text-muted mt-1" style="font-size:0.7rem;">Disponibilidad del sistema</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Consumption Chart -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="font-weight-bold mb-0">Tendencia de Consumo</h6>
          <small class="badge badge-light text-muted px-2 py-1">m³ / mes</small>
        </div>
        <LineChart :data="chartData" :options="chartOptions" style="max-height: 300px;" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./admin-resumen.component.ts"></script>

<style scoped>
.font-weight-600 { font-weight: 600; }

.stat-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.stat-icon-blue   { background: #dbeafe; }
.stat-icon-green  { background: #dcfce7; }
.stat-icon-teal   { background: #cffafe; }
.stat-icon-orange { background: #fef3c7; }

.stat-num  { font-size: 1.75rem; font-weight: 800; line-height: 1.1; }
.stat-unit { font-size: 0.78rem; color: #6c757d; }
</style>
