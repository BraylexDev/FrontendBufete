import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, of, startWith } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';
import { VerDocumentoService } from '../../../shared/components/ver-documento/ver-documento-service/ver-documento.service';


interface Country {
  id?: number;
  name: string;
  category: string;
  area: Date;
  population: number;
}

const COUNTRIES: Country[] = [
  {
    name: 'Reunión de recolección de información',
    category: 'Se recolecta la información necesaria',
    area: new Date(2023, 1, 15),
    population: 146989754,
  },
  {
    name: 'Reunión Explicación Sentencia',
    category: 'Se explica la sentencia al cliente',
    area: new Date(2024, 1, 5),
    population: 36624199,
  },
  {
    name: 'Documento conciliación',
    category: 'Redacción de documento de conciliación',
    area: new Date(2024, 6, 25),
    population: 324459463,
  }
];

function search(text: string, pipe: PipeTransform): Country[] {
  return COUNTRIES.filter((country) => {
    const term = text.toLowerCase();
    return (
      country.name.toLowerCase().includes(term) ||
      pipe.transform(country.area).includes(term) ||
      pipe.transform(country.population).includes(term)
    );
  });
}


@Component({
  selector: 'app-info-consultar',
  imports: [SharedModule, CommonModule],
  providers:[
    DecimalPipe
  ],
  templateUrl: './info-consultar.component.html',
  styleUrl: './info-consultar.component.scss'
})
export class InfoConsultarComponent {
  countries$: Observable<Country[]>;
  filter = new FormControl('', { nonNullable: true });
  page = 1;
  pageSize = 10;
  collectionSize = COUNTRIES.length;

  constructor(private pipe: DecimalPipe, private verDomuentoService: VerDocumentoService, private router: Router) {
    this.countries$ = this.filter.valueChanges.pipe(
      startWith(''),
      map((text) => search(text, pipe)),
    );
    this.refreshCountries();
  }

  refreshCountries() {
    this.countries$ = of(COUNTRIES
      .map((country, i) => ({ id: i + 1, ...country })).slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize,
      )
    );
  }

  verDocumento(url: string){
    this.verDomuentoService.urlDocumentToConsult = url;
    /* this.router.navigateByUrl('/view'); */
    window.open("/view", "_blank")
  }
}
