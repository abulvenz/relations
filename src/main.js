// jshint esversion: 6

import m from 'mithril';
import relations, { collection, relation, relationTypes } from './relations';
import { img, li, ul } from './tags';

const state = {
    users: [],
    groups: [],
    locations: [],
    cities: [],
};

const model = {
    users: collection(state.users, { idField: 'name' }),
    groups: collection(state.groups, { idField: 'name' }),
    locations: collection(state.locations, { idField: 'name' }),
    cities: collection(state.cities, { idField: 'name' })
};

// 1 user can be member of multiple groups
relation(model.users, '', model.groups)

// Read as: each user was born in exactly one city
model.users.addRelation('wasBornIn', relationTypes.ONE_TO_ONE, model.cities);

// Each city can be the birthplace of 0-N users
model.cities.addRelation('isBirthplaceOf', relationTypes.ZERO_TO_N, model.users, 'wasBornIn');

// Each group was created by exactly one user
model.groups.addRelation('wasCreatedBy', relationTypes.ONE_TO_ONE, model.users);

// Each user can be the creator of 0-N groups
model.users.addRelation('isCreatorOf', relationTypes.ZERO_TO_N, model.groups)

// Each group can contain 1-N users.
model.groups.addRelation('contains', relationTypes.ONE_TO_N, model.users);

// Each user can be member in 0-N groups.
model.users.addRelation('isInGroups', relationTypes.ZERO_TO_N, model.groups);

model.users.add({ name: 'Anton' });
model.users.add({ name: 'Berta' });

model.cities.add({ name: 'Kiew' });
model.cities.add({ name: 'Curacao' });

console.log(model.users.get('Anton').wasBornIn)

model.users.get('Anton').wasBornIn = 'Kiew';
model.users.get('Berta').wasBornIn = 'Curacao';

console.log(model.users.get('Berta').wasBornIn)

relations.use(model.users.get('Anton').wasBornIn, city => {
    console.log(city.name);
});

console.log(model.cities.filterBy('Amsterdam'))
console.log(relations.first(model.cities.filterBy('Amsterdam')))

console.log(model.cities.get('Amsterdam'))

console.log(state.users)
console.log(state.cities)
console.log(state.groups)

model.groups.add({ name: 'Spökes' });
model.groups.get('Spökes').wasCreatedBy = 'Anton'

console.log(model.groups.which)
console.log(
model.groups.which.wasCreatedBy())

m.mount(document.body, {
    view: vnode => [
        ul(
            model.users.map(user => li(user.name, ' was born in ', user.wasBornIn))
        ),
        ul(
            model.cities.map(city => li(city.name, ' is birthplace of ', city.isBirthplaceOf))
        ),
        ul(
            model.groups.map(city => li(city.name, ' was created by ', city.wasCreatedBy))
        )
    ]
});
