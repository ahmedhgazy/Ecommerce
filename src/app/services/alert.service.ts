import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  success(title: string, text: string = '') {
    Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonColor: '#10B981', // green-500
      timer: 3000,
      timerProgressBar: true
    });
  }

  error(title: string, text: string = '') {
    Swal.fire({
      icon: 'error',
      title: title,
      html: text,
      confirmButtonColor: '#EF4444' // red-500
    });
  }

  async confirm(title: string, text: string, confirmButtonText: string = 'Yes, do it!'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: confirmButtonText
    });
    return result.isConfirmed;
  }

  toast(title: string, icon: SweetAlertIcon = 'success') {
      const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: icon,
          title: title
        });
  }
}
