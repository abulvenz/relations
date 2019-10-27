// jshint esversion: 6

import m from 'mithril';
import relations, { collection, relation, relationTypes } from './relations';
import { img, li, ul, pre, span } from './tags';


const a = () => {
};

const b = new Proxy(a, {
    apply(target, thisArg, args) {
        console.log('he')
    }
})

console.log(b())


const S = {
    users: [],
    groups: [],
    locations: [],
    cities: [],
};

const M = {
    users: collection(S.users, { idField: 'name' }),
    groups: collection(S.groups, { idField: 'name' }),
    locations: collection(S.locations, { idField: 'name' }),
    cities: collection(S.cities, { idField: 'name' })
};

// 1 user can be member of multiple groups
//relation(M.users, '', M.groups)

// Read as: each user was born in exactly one city
M.users.addRelation('wasBornIn', relationTypes.ONE_TO_ONE, M.cities);

// Each city can be the birthplace of 0-N users
M.cities.addRelation('isBirthplaceOf', relationTypes.ZERO_TO_N, M.users, 'wasBornIn.name');

// Each group was created by exactly one user
M.groups.addRelation('wasCreatedBy', relationTypes.ONE_TO_ONE, M.users);

// Each user can be the creator of 0-N groups
M.users.addRelation('isCreatorOf', relationTypes.ZERO_TO_N, M.groups, 'wasCreatedBy.name')

// Each user can be member in 0-N groups, that can have M members.
M.users.addRelation('isInGroups', relationTypes.N_TO_M, M.groups, 'contains.name');

// Add users
M.users.add({ name: 'Berta' });
M.users.add({ name: 'Anton' });

// Add cities
M.cities.add({ name: 'Kiew' });
M.cities.add({ name: 'Curacao' });

//console.log(M.users.get('Anton').wasBornIn)

M.users.get('Anton').wasBornIn = 'Kiew';
M.users.get('Berta').wasBornIn = 'Kiew';

console.log('Result',M.users.filterByProperty('wasBornIn.name','Kiew').map(f=>f()))

console.log(S)


console.log(M.users.get('Berta').wasBornIn)

relations.use(M.users.get('Anton').wasBornIn, city => {
    console.log(city.name);
});

M.groups.add({ name: 'Spökes' });

M.groups.get('Spökes').wasCreatedBy = 'Anton'

m.mount(document.body, {
    view: vnode => [
        ul(
     //       M.users.map(user => li(user.name, ' was born in ', JSON.stringify(user.wasBornIn())))
        ),
        ul(
            M.cities.map(city => li(city.name, ' is birthplace of ', JSON.stringify(city.isBirthplaceOf.map(f=>f()))))
        ),
        ul(
      //      M.groups.map(group => li(group.name, ' was created by ', JSON.stringify(group.wasCreatedBy())))
        ),
        span(relations.use(M.groups.get('Spökes'), group => ['"', group.name, '" was created by someone from "', group.wasCreatedBy.wasBornIn.name, '"'])),
        pre(JSON.stringify(S, null, 2))
    ]
});
