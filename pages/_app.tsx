import { AppProps } from "next/app";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;

// import { GetStaticProps, GetStaticPaths, GetServerSideProps } from "next";

// export const getStaticProps: GetStaticProps = async (context) => {};
// export const getStaticPaths: GetStaticPaths = async () => {};
// export const getServerSideProps: GetServerSideProps = async (context) => {};
