import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from './api';

export const exportAllData = async () => {
  try {
    // Obtener todos los datos necesarios para el backup
    const [appts, vehs, inv, invcs, usrs] = await Promise.all([
      api.get('/appointments'),
      api.get('/vehicles'),
      api.get('/inventory'),
      api.get('/invoices'),
      api.get('/users')
    ]);

    const wb = XLSX.utils.book_new();

    // Preparar hojas de excel
    const s1 = XLSX.utils.json_to_sheet(appts.data.map(a => ({
      ID: a.id, 
      Fecha: a.date, 
      Placa: a.vehicle?.plate, 
      Descripción: a.description, 
      Estado: a.status, 
      Observaciones: a.observations, 
      Evidencia: a.evidence, 
      Mecánico: a.mechanic?.name
    })));
    XLSX.utils.book_append_sheet(wb, s1, "Citas_Servicios");

    const s2 = XLSX.utils.json_to_sheet(vehs.data.map(v => ({
      Placa: v.plate, 
      Marca: v.brand, 
      Modelo: v.model, 
      Año: v.year, 
      Dueño: v.owner?.name
    })));
    XLSX.utils.book_append_sheet(wb, s2, "Vehículos");

    const s3 = XLSX.utils.json_to_sheet(inv.data);
    XLSX.utils.book_append_sheet(wb, s3, "Inventario");

    const s4 = XLSX.utils.json_to_sheet(invcs.data);
    XLSX.utils.book_append_sheet(wb, s4, "Facturas");

    const s5 = XLSX.utils.json_to_sheet(usrs.data.map(u => ({
      Nombre: u.name, 
      Email: u.email, 
      Rol: u.role
    })));
    XLSX.utils.book_append_sheet(wb, s5, "Usuarios_Personal");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `Backup_TallerPro_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error al exportar datos:', error);
    throw error;
  }
};
