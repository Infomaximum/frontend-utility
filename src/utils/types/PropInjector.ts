import type * as hoistNonReactStatics from "hoist-non-react-statics";

export type TPropInjector<
  InjectedProps,
  AdditionalProps = unknown,
  ExtraArgs extends any[] = [],
> = <C extends React.ComponentType<React.ComponentProps<C> & InjectedProps>>(
  component: C,
  ...args: ExtraArgs
) => React.ComponentType<
  Omit<
    JSX.LibraryManagedAttributes<C, React.ComponentProps<C>>,
    keyof InjectedProps
  > &
    AdditionalProps
> &
  hoistNonReactStatics.NonReactStatics<C>;
