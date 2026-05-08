<template>
  <div class="p-4">
    <div class="mb-4">
      <h3 class="font-weight-bold mb-1">Facturación Manual</h3>
      <p class="text-muted mb-0">Genera facturas individuales calculando automáticamente consumos y tarifas</p>
    </div>

    <div v-if="successMsg" class="alert alert-success d-flex align-items-center">
      <font-awesome-icon icon="check-circle" class="mr-2" /> {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center">
      <font-awesome-icon icon="exclamation-circle" class="mr-2" /> {{ errorMsg }}
    </div>

    <div class="row">
      <!-- Left: Form -->
      <div class="col-lg-7 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="text-primary mb-4">
              <font-awesome-icon icon="clipboard-list" class="mr-2" /> Datos de Consumo
            </h5>

            <!-- User Search -->
            <div class="form-group">
              <label class="font-weight-600">Buscar Usuario (Nombre o ID)</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Ej: Juan Pérez"
                  v-model="personSearch"
                  @keyup.enter="searchPeople"
                />
                <div class="input-group-append">
                  <button class="btn btn-primary" @click="searchPeople" :disabled="isSearching">
                    <font-awesome-icon :icon="isSearching ? 'spinner' : 'search'" :spin="isSearching" />
                  </button>
                </div>
              </div>
              <div v-if="searchResults.length" class="list-group mt-1 shadow-sm">
                <button
                  v-for="person in searchResults"
                  :key="person.id"
                  class="list-group-item list-group-item-action"
                  @click="selectPerson(person)"
                >
                  <strong>{{ person.fullName }}</strong>
                  <small class="text-muted ml-2">{{ person.documentNumber }}</small>
                </button>
              </div>
            </div>

            <div v-if="selectedPerson" class="alert alert-info mb-3 py-2">
              <font-awesome-icon icon="user" class="mr-2" />
              Suscriptor seleccionado: <strong>{{ selectedPerson.fullName }}</strong>
              (Doc: {{ selectedPerson.documentNumber }})
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-weight-600">Lectura Anterior (m³)</label>
                  <input type="number" class="form-control" v-model.number="form.prevReading" min="0" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-weight-600">Lectura Actual (m³)</label>
                  <input type="number" class="form-control" v-model.number="form.currentReading" min="0" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-weight-600">Tarifa por m³</label>
                  <input type="number" class="form-control" v-model.number="form.rate" min="0" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-weight-600">Cargo Fijo</label>
                  <input type="number" class="form-control" v-model.number="form.fixedCharge" min="0" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-weight-600">Subsidio (%)</label>
                  <input type="number" class="form-control" v-model.number="form.subsidy" min="0" max="1" step="0.01" placeholder="Ej: 0.15" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-weight-600">Recargos Adicionales</label>
                  <input type="number" class="form-control" v-model.number="form.surcharges" min="0" />
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-block mt-2" @click="generateInvoice" :disabled="isGenerating">
              <font-awesome-icon :icon="isGenerating ? 'spinner' : 'file-invoice'" :spin="isGenerating" class="mr-2" />
              {{ isGenerating ? 'Generando...' : 'Generar Factura' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Summary -->
      <div class="col-lg-5 mb-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="text-primary mb-4">
              <font-awesome-icon icon="clipboard" class="mr-2" /> Resumen de Liquidación
            </h5>

            <div class="summary-row d-flex justify-content-between py-2">
              <span class="text-muted">Consumo del periodo:</span>
              <span class="font-weight-bold">{{ summary.consumption }} m³</span>
            </div>
            <div class="summary-row d-flex justify-content-between py-2">
              <span class="text-muted">Valor Consumo:</span>
              <span>{{ formatCurrency(summary.consumptionValue) }}</span>
            </div>
            <div class="summary-row d-flex justify-content-between py-2">
              <span class="text-muted">Cargo Fijo:</span>
              <span>{{ formatCurrency(form.fixedCharge) }}</span>
            </div>
            <div class="summary-row d-flex justify-content-between py-2">
              <span class="font-weight-600">Subtotal:</span>
              <span class="font-weight-600">{{ formatCurrency(summary.subtotal) }}</span>
            </div>
            <div class="summary-row d-flex justify-content-between py-2 text-success">
              <span class="font-weight-600">
                Subsidio Aplicado ({{ Math.round(form.subsidy * 100) }}%):
              </span>
              <span>- {{ formatCurrency(summary.subsidyApplied) }}</span>
            </div>
            <div class="summary-row d-flex justify-content-between py-2 text-danger">
              <span>Recargos:</span>
              <span>+ {{ formatCurrency(form.surcharges) }}</span>
            </div>

            <div class="mt-4 p-3 bg-primary rounded text-white d-flex justify-content-between align-items-center">
              <span class="font-weight-bold">TOTAL A PAGAR:</span>
              <span class="h4 mb-0 font-weight-800">{{ formatCurrency(summary.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./admin-facturacion.component.ts"></script>

<style scoped>
.font-weight-600 { font-weight: 600; }
.font-weight-800 { font-weight: 800; }
.summary-row {
  border-bottom: 1px solid #f0f0f0;
}
.summary-row:last-of-type {
  border-bottom: none;
}
</style>
