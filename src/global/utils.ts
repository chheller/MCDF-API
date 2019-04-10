export function toPOJSO() {
  return this.toObject({
    versionKey: false,
    transform: (doc: any, ret: any) => {
      delete ret._id;
      return ret;
    }
  });
}
