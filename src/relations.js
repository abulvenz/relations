// jshint esversion: 6
const use = (v, f) => f(v);
const pushed = (array, element) => {
    array.push(element);
    return array;
};
const isEmpty = array => array && array.length > 0;

const uuid = (() => {
    let t = new Date().getTime();
    let n = 0;
    return {
        create: () => use(
            new Date().getTime(),
            nt => nt === t ?
            t + '.' + (++n) :
            use((t = nt) && (n = 0), k => (t + '.0'))
        )
    };
})();

export function collection(data, {
    idField = 'id',
    required = [],
    optional = [],
}) {
    // Array functions
    const find = fn => data.find(fn);
    const map = fn => data.map(fn);
    const filter = fn => data.filter(fn);
    const some = fn => data.some(fn);
    const every = fn => data.every(fn);
    const reduce = args => data.reduce(...args);

    // Id functions
    const idOf = element => element[idField];
    const idEquals = id => element => idOf(element) === id;
    const propertyOf = property => element => element[property];
    const propertyEquals = (property, value) => use(propertyOf(property), prop => prop(element) === value);
    const hasId = element => !!idOf(element);

    // Collection functions
    const filterBy = id => filter(idEquals(id));
    const filterByProperty = (property, value) => filter(propertyEquals(property, value));
    const pluck = property => map(propertyOf(property));
    const contains = id => !isEmpty(filterBy(id));

        const add = element =>
            (!hasId(element) ? element[idField] = uuid.create() : ) && ;

    return {
        find,
        map,
        filter,
        some,
        every,
        reduce,
        idOf,
        idEquals,
        filterBy,
        filterByProperty,
        pluck,
    };
}