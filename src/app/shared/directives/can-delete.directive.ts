import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, Signal } from '@angular/core';
import { ProcesoDTO } from '../../../domain/models/proceso';
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';

export type ItemType = 'proceso' | 'expediente';

@Directive({
  selector: '[appCanDelete]',
  standalone: true
})
export class CanDeleteDirective implements OnInit {
  @Input() appCanDeleteItem: ProcesoDTO | ExpedienteDTO | null = null;
  @Input() appCanDeleteType: ItemType = 'proceso';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private procesoService: ProcesoService,
    private expedienteService: ExpedienteService
  ) { }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (!this.appCanDeleteItem) {
      this.viewContainer.clear();
      return;
    }

    const canDelete = this.appCanDeleteType === 'proceso'
      ? this.procesoService.canDelete(this.appCanDeleteItem as ProcesoDTO)
      : this.expedienteService.canDelete(this.appCanDeleteItem as ExpedienteDTO);

    if (canDelete) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
