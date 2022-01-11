import { AppProps } from "next/app";
import Navbar from "../components/Navbar";
// CSS
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}

export default App;

// import { GetStaticProps, GetStaticPaths, GetServerSideProps } from "next";

// export const getStaticProps: GetStaticProps = async (context) => {};
// export const getStaticPaths: GetStaticPaths = async () => {};
// export const getServerSideProps: GetServerSideProps = async (context) => {};
