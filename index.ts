type ProduceFunc = <T>(base: T, receipe: (draft: T) => any) => void;

const proxify = (data: any, updaters: any[] = []): any => {
  return new Proxy(data, {
    // create clones in get, as only needed
    // but only Link them in set traps, in order to avoid unnecessary cloning.
    get: function (target, key) {
      const val = Reflect.get(target, key);
      console.log({ target }, { key });
      // if function met, meaning prototype functions on Array here in js
      if (Object(val) === val && !(val instanceof Function)) {
        // if (Object(val) === val && !(val instanceof Function)) {
        // object
        const clone = Array.isArray(val) ? [...val] : { ...val };
        const updater = (newVal: any) => {
          target[key] = newVal;
          return target;
        };
        const proxy = proxify(clone, [...updaters, updater]);
        return proxy;
      } else {
        // primitive
        return val;
      }
    },

    // when data changes, link clones up
    set: function (target, key, value) {
      const prevVal = Reflect.get(target, key);
      if (prevVal !== value) {
        target[key] = value;
        console.log(String(updaters), 'updaters');
        updaters.reduceRight((result, updaters) => {
          console.log({ target }, { key }, { value }, { result });
          return updaters(result);
        }, target);
      }
      return true;
    },

    // when data changes, link clones up
    deleteProperty: function (target, key) {
      const deleted = Reflect.deleteProperty(target, key);
      if (deleted) {
        updaters.reduceRight((result, updaters) => updaters(result), target);
      }
      return deleted;
    },
  });
};

const produce: ProduceFunc = (base, recipe) => {
  const root = {
    result: base,
  };

  const proxy = proxify(root);

  recipe(proxy.result);

  return root.result;
};

const state = [
  {
    name: 'BFE',
  },
  {
    name: '.',
  },
];

const newState = produce(state, (draft) => {
  draft.push({ name: 'dev' });
  // draft[0].name = 'bigfrontend';
  // draft[1].name = '.'; // set为相同值。
});

console.log({ state }, { newState });
