<template>
  <div class="p-4">
    <div class="mb-4">
      <h3 class="font-weight-bold mb-1">Actividad Reciente</h3>
      <p class="text-muted mb-0">Registros de eventos del sistema y acciones de usuarios.</p>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="isFetching" class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="!activities.length" class="text-center py-5 text-muted">
          <font-awesome-icon icon="clock" class="fa-3x mb-3" />
          <p>No hay actividad registrada aún.</p>
        </div>

        <!-- List -->
        <div v-else>
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-item d-flex align-items-start px-4 py-3"
          >
            <!-- Icon -->
            <div class="activity-icon mr-4" :class="`activity-icon-${actionColor(activity.action)}`">
              <font-awesome-icon :icon="actionIcon(activity.action)" />
            </div>

            <!-- Body -->
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="font-weight-bold" style="font-size:0.9rem;">
                    {{ activity.personName || 'Sistema' }}
                  </div>
                  <div class="text-muted" style="font-size:0.85rem;">{{ actionLabel(activity.action) }}</div>
                  <div v-if="activity.reference" class="text-muted small">{{ activity.reference }}</div>
                  <div v-if="activity.description" class="text-muted small">{{ activity.description }}</div>
                </div>
                <div class="text-right ml-3">
                  <div class="text-muted small text-nowrap">{{ timeAgo(activity.createdAt) }}</div>
                  <div v-if="activity.amount" class="text-success font-weight-bold mt-1" style="font-size:0.9rem;">
                    ${{ Number(activity.amount).toLocaleString('es-CO') }}
                    <font-awesome-icon icon="check-circle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./admin-actividad.component.ts"></script>

<style scoped>
.activity-item {
  border-bottom: 1px solid #f0f4f8;
}
.activity-item:last-child { border-bottom: none; }

.activity-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.activity-icon-success   { background: #dcfce7; color: #16a34a; }
.activity-icon-info      { background: #dbeafe; color: #2563eb; }
.activity-icon-warning   { background: #fef3c7; color: #d97706; }
.activity-icon-danger    { background: #fee2e2; color: #dc2626; }
.activity-icon-secondary { background: #f3f4f6; color: #6b7280; }
</style>
