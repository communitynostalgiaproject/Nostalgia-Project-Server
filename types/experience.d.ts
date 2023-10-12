declare interface Experience {
  title: string;
  place: Place;
  description: string;
  recipe?: string;
  experienceDate: string;
  createdDate: string;
  mood?: string;
  foodtype?: string;
  personItRemindsThemOf?: string;
  flavourProfile?: string;
  periodOfLifeAssociation?: string;
  placesToGetFood?: [Place];
  creatorGoogleId?: string;
}

