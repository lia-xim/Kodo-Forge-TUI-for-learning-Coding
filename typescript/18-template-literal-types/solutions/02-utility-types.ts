/**
 * Lektion 18 - Loesung 02
 */
type ScreamingCase<T extends string> = Uppercase<T>;
type GetterName<T extends string> = `get${Capitalize<T>}`;
type SetterName<T extends string> = `set${Capitalize<T>}`;
type EventName<T extends string> = `on${Capitalize<T>}`;
type HttpHeader<T extends string> = Capitalize<T>;

type Props = "name" | "age" | "email";
type AllGetters = GetterName<Props>;
type AllSetters = SetterName<Props>;
type AllEvents = EventName<Props>;
type AllAccessors = AllGetters | AllSetters | AllEvents;
