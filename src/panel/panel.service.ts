import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type Libro = {
  id: number; titulo: string; autor: string;
  anio: number | null; paginas: number | null;      // Google Books no siempre los trae
  categoria: string; isbn13: string | null;
  sinopsis: string; ejemplares: number;
};
export type Prestamo = {
  id: number; libroId: number; usuarioSub: string;
  desde: string; hasta: string; devuelto: boolean;
};

@Injectable()
export class PanelService {
  private readonly librosUrl: string;
  private readonly prestamosUrl: string;

  constructor(config: ConfigService) {
    this.librosUrl    = config.getOrThrow<string>('LIBROS_URL');
    this.prestamosUrl = config.getOrThrow<string>('PRESTAMOS_URL');
  }

  // fetch NO lanza con un 404 ni con un 500: hay que mirar .ok a mano. Es lo de X4.
  private async pedir<T>(url: string, nombre: string): Promise<T> {
    let respuesta: Response;
    try {
      respuesta = await fetch(url);
    } catch {
      throw new ServiceUnavailableException(`el microservicio de ${nombre} no responde`);
    }
    if (!respuesta.ok) {
      throw new ServiceUnavailableException(`el microservicio de ${nombre} devolvio ${respuesta.status}`);
    }
    return (await respuesta.json()) as T;
  }

  // Las dos llamadas salen juntas. Acá esta el argumento entero del BFF.
  private async traerTodo(): Promise<[Libro[], Prestamo[]]> {
    return Promise.all([
      this.pedir<Libro[]>(this.librosUrl, 'libros'),
      this.pedir<Prestamo[]>(this.prestamosUrl, 'prestamos'),
    ]);
  }

  // El cruce que hoy hace el navegador, hecho acá.
  private unir(prestamos: Prestamo[], libros: Libro[]) {
    const porId = new Map(libros.map((l) => [l.id, l]));
    return prestamos.map(({ libroId, ...resto }) => ({
      ...resto,
      libro: porId.get(libroId) ?? { id: libroId, titulo: 'libro no encontrado' },
    }));
  }

  async mios(sub: string) {
    const [libros, prestamos] = await this.traerTodo();
    const mios = prestamos.filter((p) => p.usuarioSub === sub);
    return { total: mios.length, prestamos: this.unir(mios, libros) };
  }

  async todos() {
    const [libros, prestamos] = await this.traerTodo();
    return { total: prestamos.length, prestamos: this.unir(prestamos, libros) };
  }

  // Solo para medir en el 4.3. En un proyecto de verdad esto no existiria.
  async miosEnSerie(sub: string) {
    const libros    = await this.pedir<Libro[]>(this.librosUrl, 'libros');
    const prestamos = await this.pedir<Prestamo[]>(this.prestamosUrl, 'prestamos');
    const mios = prestamos.filter((p) => p.usuarioSub === sub);
    return { total: mios.length, prestamos: this.unir(mios, libros) };
  }
}
