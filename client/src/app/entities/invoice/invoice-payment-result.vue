<template>
  <div class="row justify-content-center mt-5">
    <div class="col-md-6 text-center">
      <div v-if="loading">
        <p>Verificando pago...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger">
        <h4>Error</h4>
        <p>{{ error }}</p>
        <button class="btn btn-secondary" @click="goToInvoice">Volver a la factura</button>
      </div>

      <div v-else-if="boldStatus === 'APPROVED'" class="alert alert-success">
        <h3>✓ Pago aprobado</h3>
        <p>El pago fue procesado exitosamente. La factura ha sido marcada como pagada.</p>
        <button class="btn btn-success" @click="goToInvoice">Ver factura</button>
      </div>

      <div v-else-if="['REJECTED', 'FAILED', 'VOIDED'].includes(boldStatus)" class="alert alert-danger">
        <h3>✗ Pago no aprobado</h3>
        <p>El pago fue rechazado o falló (estado: {{ boldStatus }}). La factura no fue modificada.</p>
        <button class="btn btn-secondary" @click="goToInvoice">Volver a la factura</button>
      </div>

      <div v-else class="alert alert-warning">
        <h3>Pago en proceso</h3>
        <p>El pago está siendo procesado (estado: {{ boldStatus ?? 'PENDIENTE' }}). Se notificará cuando se confirme.</p>
        <button class="btn btn-secondary" @click="goToInvoice">Volver a la factura</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./invoice-payment-result.component.ts"></script>
