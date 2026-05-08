export interface IAddress {
  id?: number;
  neighborhood?: string;
  street?: string | null;
  houseNumber?: string | null;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export class Address implements IAddress {
  constructor(
    public id?: number,
    public neighborhood?: string,
    public street?: string | null,
    public houseNumber?: string | null,
    public city?: string,
    public latitude?: number | null,
    public longitude?: number | null,
  ) {}
}
