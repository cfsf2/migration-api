export const cambiarKey = ({
  o,
  oldKey,
  newKey,
}: {
  o: any;
  oldKey: string;
  newKey: string;
}) => {
  delete Object.assign(o, { [newKey]: o[oldKey] })[oldKey];
};

export const enumaBool = (e) => {
  const claves = Object.keys(e);
  claves.forEach((k) => {
    if (e[k] === "s") {
      e[k] = true;
    }
    if (e[k] === "n") {
      e[k] = false;
    }
  });

  return e;
};
