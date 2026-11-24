import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider } from './state';
import { Voice } from './components/bits';
import { pick } from './core/voice';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ResourcePage from './pages/ResourcePage';
import Compare from './pages/Compare';
import Builder from './pages/Builder';
import Templates, { TemplatePage } from './pages/Templates';
import Simulator from './pages/Simulator';
import Gems from './pages/Gems';
import Saved from './pages/Saved';
import RandomPick from './pages/RandomPick';
import { HowItsBuilt, Methodology, NotFound } from './pages/Static';

const ApiDirectory = lazy(() => import('./pages/ApiDirectory'));

export function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Layout>
          <Suspense fallback={<Voice line={pick('loading', Date.now())} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/r/:id" element={<ResourcePage />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/build" element={<Builder />} />
              <Route path="/stacks" element={<Templates />} />
              <Route path="/stacks/:id" element={<TemplatePage />} />
              <Route path="/simulate" element={<Simulator />} />
              <Route path="/gems" element={<Gems />} />
              <Route path="/random" element={<RandomPick />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/apis" element={<ApiDirectory />} />
              <Route path="/methodology" element={<Methodology />} />
              <Route path="/how-its-built" element={<HowItsBuilt />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </AppProvider>
    </HashRouter>
  );
}
