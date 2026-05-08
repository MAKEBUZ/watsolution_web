<template>
  <div class="portal-bg">
    <!-- Loading -->
    <div v-if="isFetching" class="text-center pt-5 pb-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-muted">Cargando tu portal...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="container-fluid px-4 pt-4">
      <div class="alert alert-warning">
        <font-awesome-icon icon="exclamation-triangle" class="mr-2" />
        {{ error }}
      </div>
    </div>

    <!-- Portal content -->
    <div v-else class="container-fluid px-4 pt-4">
      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center">
          <div class="subscriber-avatar mr-3">
            <font-awesome-icon icon="user" />
          </div>
          <div>
            <h2 class="mb-0 font-weight-bold">Hola, {{ data?.person?.fullName ?? 'Usuario' }}</h2>
            <small class="text-muted">
              Suscriptor #{{ data?.person?.subscriberNumber ?? data?.person?.id ?? '—' }}
              <span v-if="data?.person?.stratum"> • Estrato {{ data.person.stratum }}</span>
            </small>
          </div>
        </div>
        <div class="notification-bell-wrap">
          <div class="notification-bell">
            <font-awesome-icon icon="bell" />
          </div>
          <span class="bell-badge">3</span>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card portal-stat-card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="pstat-icon pstat-green mr-3">
                <font-awesome-icon icon="chart-line" class="text-success" />
              </div>
              <div>
                <div class="pstat-val text-success">{{ data?.person?.savingsPercent ?? 0 }}%</div>
                <div class="pstat-label">Ahorro Acumulado</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card portal-stat-card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="pstat-icon pstat-orange mr-3">
                <font-awesome-icon icon="medal" class="text-warning" />
              </div>
              <div>
                <div class="pstat-val text-warning">{{ (data?.person?.greenPoints ?? 0).toLocaleString('es-CO') }}</div>
                <div class="pstat-label">Puntos Verdes</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card portal-stat-card h-100">
            <div class="card-body d-flex align-items-center">
              <div class="pstat-icon pstat-blue mr-3">
                <font-awesome-icon icon="clock" class="text-primary" />
              </div>
              <div>
                <div class="pstat-val text-primary">{{ data?.person?.daysSinceLastDebt ?? 0 }}</div>
                <div class="pstat-label">Días sin Mora</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Left Column -->
        <div class="col-lg-8 mb-4">
          <!-- Trámites y Consultas -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="font-weight-bold mb-4">Trámites y Consultas</h5>
              <div class="row text-center">
                <div class="col-3">
                  <div class="tramite-item" @click="$router.push('/portal/reporte/fuga')">
                    <div class="tramite-icon">
                      <font-awesome-icon icon="tint" />
                    </div>
                    <small>Reportar Fuga</small>
                  </div>
                </div>
                <div class="col-3">
                  <div class="tramite-item" @click="$router.push('/portal/reporte/reclamacion')">
                    <div class="tramite-icon">
                      <font-awesome-icon icon="comment-alt" />
                    </div>
                    <small>Reclamaciones</small>
                  </div>
                </div>
                <div class="col-3">
                  <div class="tramite-item" @click="$router.push('/portal/certificados')">
                    <div class="tramite-icon">
                      <font-awesome-icon icon="history" />
                    </div>
                    <small>Certificados</small>
                  </div>
                </div>
                <div class="col-3">
                  <div class="tramite-item" @click="$router.push('/account/settings')">
                    <div class="tramite-icon">
                      <font-awesome-icon icon="cog" />
                    </div>
                    <small>Mi Perfil</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Invoice History -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="font-weight-bold mb-0">Historial</h5>
                <a href="#" class="text-primary small font-weight-600">Ver todo</a>
              </div>
              <div v-if="!data?.invoiceHistory?.length" class="text-muted small text-center py-3">
                No hay facturas registradas.
              </div>
              <div
                v-for="inv in data?.invoiceHistory"
                :key="inv.id"
                class="inv-row d-flex align-items-center justify-content-between py-2"
              >
                <div class="d-flex align-items-center">
                  <div class="inv-icon mr-3">
                    <font-awesome-icon icon="file-invoice" />
                  </div>
                  <div>
                    <div class="font-weight-600" style="font-size:0.9rem;">{{ invoiceRef(inv) }}</div>
                    <small class="text-muted">{{ formatDateShort(inv.issueDate) }}</small>
                  </div>
                </div>
                <div class="d-flex align-items-center">
                  <span class="font-weight-bold mr-3">{{ formatCurrency(inv.amountDue) }}</span>
                  <button class="btn btn-link btn-sm p-0">
                    <font-awesome-icon icon="download" class="text-muted" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actividad Reciente -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="font-weight-bold mb-3">Actividad Reciente</h5>
              <div v-for="act in recentActivities" :key="act.id" class="act-row d-flex align-items-start py-2">
                <div class="act-icon mr-3" :class="act.iconClass">
                  <font-awesome-icon :icon="act.icon" />
                </div>
                <div>
                  <div class="font-weight-600" style="font-size:0.85rem;">{{ act.title }}</div>
                  <div class="text-muted small">{{ act.description }}</div>
                  <div class="text-muted" style="font-size:0.72rem;">{{ act.timeAgo }}</div>
                </div>
              </div>
              <div v-if="!recentActivities.length" class="text-muted small text-center py-2">
                Sin actividad reciente.
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="col-lg-4 mb-4">
          <!-- Factura Actual -->
          <div class="card shadow-sm mb-4 current-invoice-card">
            <div class="card-body">
              <h6 class="text-muted mb-3">Factura Actual</h6>
              <div v-if="data?.currentInvoice">
                <div class="invoice-amount">
                  <span class="invoice-currency">$</span>{{ Number(data.currentInvoice.amountDue).toLocaleString('es-CO') }}
                </div>
                <div class="d-flex align-items-center mt-2 mb-4">
                  <font-awesome-icon icon="calendar" class="text-danger mr-2" style="font-size:0.8rem;" />
                  <small class="text-muted">Vence: {{ formatDateLong(data.currentInvoice.dueDate) }}</small>
                </div>
                <router-link to="/pagos" class="btn btn-pay btn-block font-weight-bold">
                  <font-awesome-icon icon="credit-card" class="mr-2" /> Pagar Ahora
                </router-link>
              </div>
              <div v-else class="text-muted text-center py-3">
                No hay facturas pendientes
              </div>
            </div>
          </div>

          <!-- Consumption Bar Chart -->
          <div class="card shadow-sm">
            <div class="card-body">
              <h6 class="font-weight-bold mb-3">Tendencia de Consumo</h6>
              <BarChart
                v-if="barChartData.labels.length"
                :data="barChartData"
                :options="barChartOptions"
                style="max-height: 220px;"
              />
              <p v-else class="text-muted text-center small py-3">Sin datos de consumo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./portal-dashboard.component.ts"></script>

<style scoped>
.portal-bg {
  background-color: #f0f5fb;
  min-height: calc(100vh - 60px);
}

/* Header */
.subscriber-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0eaf5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #1a3a5c;
}

.notification-bell-wrap {
  position: relative;
}
.notification-bell {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6c757d;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stat cards */
.portal-stat-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
}
.pstat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.pstat-green  { background: #dcfce7; }
.pstat-orange { background: #fef3c7; }
.pstat-blue   { background: #dbeafe; }
.pstat-val    { font-size: 1.5rem; font-weight: 800; line-height: 1.1; }
.pstat-label  { font-size: 0.78rem; color: #6c757d; }

/* Trámites */
.tramite-item {
  cursor: pointer;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  transition: background 0.2s;
}
.tramite-item:hover { background: #e8f0fb; }
.tramite-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #f0f5fb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #1a3a5c;
  margin: 0 auto 0.4rem;
}

/* Invoice list */
.inv-row { border-bottom: 1px solid #f0f0f0; }
.inv-row:last-child { border-bottom: none; }
.inv-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 0.9rem;
}

/* Activity */
.act-row { border-bottom: 1px solid #f0f0f0; }
.act-row:last-child { border-bottom: none; }
.act-icon {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}
.act-pay    { background: #d1fae5; color: #059669; }
.act-report { background: #dbeafe; color: #2563eb; }
.act-system { background: #f3f4f6; color: #6b7280; }

/* Current invoice card */
.current-invoice-card {
  border: none;
  border-radius: 16px;
}
.invoice-amount {
  font-size: 2rem;
  font-weight: 800;
  color: #1a2d42;
}
.invoice-currency {
  font-size: 1rem;
  font-weight: 600;
  color: #6c757d;
  margin-right: 2px;
}

.btn-pay {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.65rem;
  transition: background 0.2s;
}
.btn-pay:hover { background: #1d4ed8; color: white; text-decoration: none; }

.font-weight-600 { font-weight: 600; }
</style>
