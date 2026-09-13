import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  Home,
  Leaf,
  Lock,
  Menu,
  MessageCircleWarning,
  MonitorCheck,
  Network,
  Rocket,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  Users,
  Wifi,
  WifiOff
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";

type InternetMode = "sem-internet" | "com-internet";
type Organization = "individual" | "dupla" | "grupo";
type FocusOption = "alto" | "medio" | "baixo";

type SessionForm = {
  discipline: string;
  grade: string;
  kit: string;
  duration: number;
  students: number;
  phones: number;
  internet: InternetMode;
  organization: Organization;
};

type Group = {
  id: string;
  name: string;
  members: number;
  progress: number;
  mission: number;
  color: string;
};

type StudentSubmission = {
  hypothesis: string;
  photoName?: string;
  sent: boolean;
};

type Reflection = {
  focus?: FocusOption;
  note: string;
  completed: boolean;
};

type AppState = {
  form: SessionForm;
  planGenerated: boolean;
  groups: Group[];
  studentSubmission: StudentSubmission;
  reflection: Reflection;
  sessionFinished: boolean;
  toast?: string;
};

const storageKey = "aula-local-prototipo-v2";

const defaultForm: SessionForm = {
  discipline: "Ciências",
  grade: "8º ano",
  kit: "Fotossíntese no cotidiano",
  duration: 25,
  students: 30,
  phones: 8,
  internet: "sem-internet",
  organization: "grupo"
};

const groupNames = ["Girassol", "Ipê", "Jabuticaba", "Mangueira", "Araucária", "Tucano"];
const groupColors = ["bg-yellow-400", "bg-emerald-500", "bg-violet-500", "bg-cyan-500", "bg-teal-700", "bg-orange-400"];
const roles = ["observador", "fotógrafo", "relator", "porta-voz", "guardião do foco"];

function createGroups(form: SessionForm): Group[] {
  const maxUsefulPhones = Math.max(1, Math.min(form.phones, form.students));
  const targetSize = form.organization === "individual" ? 1 : form.organization === "dupla" ? 2 : 5;
  const minimumGroups = Math.ceil(form.students / targetSize);
  const groupCount = Math.min(maxUsefulPhones, Math.max(1, minimumGroups));
  const baseMembers = Math.floor(form.students / groupCount);
  const remainder = form.students % groupCount;

  return Array.from({ length: groupCount }, (_, index) => ({
    id: `grupo-${index + 1}`,
    name: groupNames[index] ?? `Grupo ${index + 1}`,
    members: baseMembers + (index < remainder ? 1 : 0),
    progress: index === 0 ? 45 : index === 1 ? 40 : index === 2 ? 25 : index === 3 ? 40 : index === 4 ? 25 : 40,
    mission: index === 2 || index === 4 ? 1 : 2,
    color: groupColors[index] ?? "bg-emerald-500"
  }));
}

function initialState(): AppState {
  return {
    form: defaultForm,
    planGenerated: false,
    groups: createGroups(defaultForm),
    studentSubmission: { hypothesis: "", sent: false },
    reflection: { note: "", completed: false },
    sessionFinished: false
  };
}

function loadState(): AppState {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return initialState();
  try {
    return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    return initialState();
  }
}

function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!state.toast) return;
    const id = window.setTimeout(() => setState((current) => ({ ...current, toast: undefined })), 2600);
    return () => window.clearTimeout(id);
  }, [state.toast]);

  const update = (patch: Partial<AppState>) => setState((current) => ({ ...current, ...patch }));
  const resetDemo = () => {
    localStorage.removeItem(storageKey);
    setState({ ...initialState(), toast: "Demonstração reiniciada." });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-navy-950 text-slate-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,.26),transparent_26rem),radial-gradient(circle_at_92%_12%,rgba(139,124,246,.18),transparent_24rem),linear-gradient(135deg,#07152f_0%,#0b1733_58%,#061226_100%)]" />
      <Shell isOnline={isOnline} resetDemo={resetDemo}>
        <Routes>
          <Route path="/" element={<Dashboard state={state} isOnline={isOnline} />} />
          <Route path="/criar" element={<CreateSession state={state} update={update} />} />
          <Route path="/plano" element={<Plan state={state} update={update} />} />
          <Route path="/sessao" element={<RunningSession state={state} update={update} isOnline={isOnline} />} />
          <Route path="/estudante" element={<StudentExperience state={state} update={update} isOnline={isOnline} />} />
          <Route path="/reflexao" element={<Reflection state={state} update={update} />} />
          <Route path="/resumo" element={<TeacherSummary state={state} update={update} />} />
        </Routes>
      </Shell>
      {state.toast ? <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-glow">{state.toast}</div> : null}
    </div>
  );
}

function Shell({ children, isOnline, resetDemo }: { children: ReactNode; isOnline: boolean; resetDemo: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1560px] flex-col p-3 text-slate-950 md:p-5">
      <header className="hero-panel mb-4 overflow-hidden rounded-[2rem] border border-white/10 bg-navy-900/80 p-5 text-white shadow-glow backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Logo large />
            <div className="min-w-0">
              <h1 className="text-4xl font-black tracking-normal md:text-6xl">
                Aula <span className="text-emerald-300">Local</span>
              </h1>
              <p className="mt-1 text-lg text-slate-200 md:text-2xl">A tecnologia se adapta à realidade da escola.</p>
              <p className="mt-3 text-xs font-black uppercase tracking-[.28em] text-white md:text-sm">Foco · Autonomia · Privacidade · Acesso</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] lg:w-[42rem]">
            <div className="hidden min-h-36 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#d9f7e8,#f8fafc)] p-4 text-navy-900 shadow-laptop sm:block">
              <div className="grid h-full grid-cols-[1.2fr_.8fr] items-center gap-3">
                <div className="photo-card h-full rounded-[1.5rem]" />
                <p className="rotate-[-4deg] text-2xl font-semibold leading-tight">Mesmo lugar. Mais possibilidades.</p>
              </div>
            </div>
            <div className="sticky-note rotate-2 rounded-[1.4rem] bg-[#e9ffd5] p-5 text-center text-lg font-bold leading-tight text-navy-900 shadow-laptop">
              Educação de verdade acontece em qualquer conexão.
            </div>
          </div>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className={`${open ? "block" : "hidden"} rounded-[1.5rem] border border-white/10 bg-white/95 p-3 shadow-laptop lg:block`}>
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <Logo />
            <button className="icon-button" onClick={() => setOpen(false)} type="button" aria-label="Fechar menu">×</button>
          </div>
          <nav className="grid gap-2">
            <SideLink to="/" icon={<Home size={18} />} label="Início" />
            <SideLink to="/criar" icon={<Settings size={18} />} label="Criar sessão" />
            <SideLink to="/plano" icon={<MonitorCheck size={18} />} label="Plano adaptado" />
            <SideLink to="/sessao" icon={<BarChart3 size={18} />} label="Sessão" />
            <SideLink to="/estudante" icon={<Smartphone size={18} />} label="Aluno" />
            <SideLink to="/resumo" icon={<ShieldCheck size={18} />} label="Resumo" />
          </nav>
          <OfflineBadge isOnline={isOnline} />
          <button className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700" onClick={resetDemo} type="button">
            Reiniciar demonstração
          </button>
        </aside>
        <main className="min-w-0">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-2 text-white lg:hidden">
            <Logo />
            <button className="icon-button bg-white text-navy-900" onClick={() => setOpen(true)} type="button" aria-label="Abrir menu">
              <Menu size={18} />
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ state, isOnline }: { state: AppState; isOnline: boolean }) {
  return (
    <Screen step="01" eyebrow="Dashboard da professora" title="Olá, professora Ana 👋" subtitle="Que bom ter você por aqui. Vamos criar uma sessão pronta para a realidade da escola.">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Panel className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusPill icon={isOnline ? <Wifi size={16} /> : <WifiOff size={16} />} label={isOnline ? "Pronto para uso offline" : "Funcionando offline"} />
            <Link className="primary-button" to="/criar"><Sparkles size={18} /> Criar nova sessão</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard icon={<Download />} title="Kits baixados" value="12 kits disponíveis" detail="Fotossíntese no cotidiano está pronto." />
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black text-navy-900">Sessões recentes</h3>
                <span className="text-xs font-bold text-emerald-700">Ver todas</span>
              </div>
              {["Fotossíntese no cotidiano", "Cadeia alimentar local", "Seres vivos e ambiente"].map((item, index) => (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 last:mb-0" key={item}>
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${index === 0 ? "bg-yellow-400" : index === 1 ? "bg-emerald-500" : "bg-violet-500"}`} />
                    <div>
                      <p className="text-sm font-black">{item}</p>
                      <p className="text-xs text-slate-500">8º ano · {index === 2 ? "05/03" : "12/03"}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{index === 2 ? "Em andamento" : "Concluída"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-r from-emerald-50 to-amber-50 p-4 text-sm font-semibold text-slate-700">
            O professor acompanha a aprendizagem, não a vida digital do aluno.
          </div>
        </Panel>
        <Panel className="grid content-between gap-4 bg-gradient-to-br from-mintLocal to-white">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">Demonstração</p>
            <h3 className="mt-2 text-3xl font-black text-navy-900">Experiência do estudante</h3>
            <p className="mt-2 text-slate-600">Veja como o Grupo Girassol registra evidências e envia uma hipótese sem depender de internet.</p>
          </div>
          <PhonePreview state={state} compact />
          <Link className="secondary-button justify-center" to="/estudante"><Smartphone size={18} /> Abrir visão mobile</Link>
        </Panel>
      </div>
    </Screen>
  );
}

function CreateSession({ state, update }: { state: AppState; update: (patch: Partial<AppState>) => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<SessionForm>(state.form);
  const recommendation = useMemo(() => createGroups(form), [form]);

  function submit(event: FormEvent) {
    event.preventDefault();
    update({ form, groups: recommendation, planGenerated: true, sessionFinished: false, toast: "Plano da sessão gerado." });
    navigate("/plano");
  }

  return (
    <Screen step="02" eyebrow="Criar sessão" title="Defina os detalhes da atividade" subtitle="Nós cuidamos da adaptação para a infraestrutura disponível.">
      <Panel>
        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Disciplina"><Select value={form.discipline} onChange={(value) => setForm({ ...form, discipline: value })} options={["Ciências", "Matemática", "Geografia", "Português"]} /></Field>
            <Field label="Ano escolar"><Select value={form.grade} onChange={(value) => setForm({ ...form, grade: value })} options={["6º ano", "7º ano", "8º ano", "9º ano"]} /></Field>
            <Field label="Duração"><NumberInput value={form.duration} suffix="min" onChange={(duration) => setForm({ ...form, duration })} /></Field>
            <Field label="Tema ou kit"><Select value={form.kit} onChange={(kit) => setForm({ ...form, kit })} options={["Fotossíntese no cotidiano", "Cadeia alimentar local", "Seres vivos e ambiente"]} /></Field>
            <Field label="Número de estudantes"><NumberInput value={form.students} suffix="estudantes" onChange={(students) => setForm({ ...form, students })} /></Field>
            <Field label="Celulares disponíveis"><NumberInput value={form.phones} suffix="celulares" onChange={(phones) => setForm({ ...form, phones })} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Choice selected={form.internet === "sem-internet"} icon={<WifiOff />} title="Sem internet" text="Atividade offline" onClick={() => setForm({ ...form, internet: "sem-internet" })} />
            <Choice selected={form.internet === "com-internet"} icon={<Wifi />} title="Com internet" text="Quando disponível" onClick={() => setForm({ ...form, internet: "com-internet" })} />
          </div>
          <div className="grid gap-3 rounded-3xl bg-slate-50 p-4">
            <p className="font-black text-navy-900">Organização</p>
            <div className="grid gap-3 md:grid-cols-3">
              {(["individual", "dupla", "grupo"] as Organization[]).map((item) => (
                <button className={`rounded-2xl border p-4 text-left font-bold transition ${form.organization === item ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`} key={item} onClick={() => setForm({ ...form, organization: item })} type="button">
                  {item === "individual" ? "Individual" : item === "dupla" ? "Em dupla" : "Em grupo"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl bg-navy-900 p-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-emerald-200">Recomendação prévia</p>
              <p className="text-xl font-black">{recommendation.length} grupos · até {Math.max(...recommendation.map((group) => group.members))} estudantes por grupo · 1 celular por grupo</p>
            </div>
            <button className="primary-button" type="submit">Gerar plano da sessão <ArrowRight size={18} /></button>
          </div>
        </form>
      </Panel>
    </Screen>
  );
}

function Plan({ state, update }: { state: AppState; update: (patch: Partial<AppState>) => void }) {
  const navigate = useNavigate();
  const maxGroup = Math.max(...state.groups.map((group) => group.members));
  return (
    <Screen step="03" eyebrow="Plano adaptado" title="Plano adaptado à sua turma" subtitle="Com base nos seus dados, sugerimos o seguinte plano.">
      <div className="grid gap-4 xl:grid-cols-[1fr_.75fr]">
        <Panel>
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard icon={<Users />} title={`${state.groups.length} grupos de ${maxGroup}`} value="Trabalho colaborativo" detail="Papéis divididos para uma turma toda." />
            <InfoCard icon={<Smartphone />} title="1 celular por grupo" value={`${state.form.phones} aparelhos disponíveis`} detail="Uso compartilhado e consciente." />
            <InfoCard icon={<WifiOff />} title="Atividade 100% offline" value={`${state.form.duration} minutos`} detail="Funciona sem internet na realidade da escola." />
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-black uppercase text-emerald-700">Tema da atividade</p>
              <h3 className="mt-1 text-2xl font-black text-navy-900">Evidências da fotossíntese no ambiente</h3>
              <p className="mt-3 text-slate-600">Observar o ambiente, registrar evidências, discutir com o grupo e enviar uma hipótese sobre a participação da luz.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-sm font-black uppercase text-emerald-700">Habilidades</p>
              <ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
                <li>EF08CI06 · EF08CI07</li>
                <li>Investigação científica</li>
                <li>Trabalho em grupo</li>
                <li>Observação do ambiente</li>
              </ul>
            </div>
          </div>
        </Panel>
        <Panel>
          <h3 className="text-2xl font-black text-navy-900">Papéis do grupo</h3>
          <div className="mt-4 grid gap-3">
            {roles.map((role, index) => (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3" key={role}>
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-100 font-black text-emerald-700">{index + 1}</span>
                <span className="font-bold capitalize">{role}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button className="secondary-button flex-1" onClick={() => navigate("/criar")} type="button"><ArrowLeft size={18} /> Voltar e ajustar</button>
            <button className="primary-button flex-1" onClick={() => { update({ sessionFinished: false, toast: "Sessão BIO-482 iniciada." }); navigate("/sessao"); }} type="button">Iniciar aula <ArrowRight size={18} /></button>
          </div>
        </Panel>
      </div>
    </Screen>
  );
}

function RunningSession({ state, update, isOnline }: { state: AppState; update: (patch: Partial<AppState>) => void; isOnline: boolean }) {
  const navigate = useNavigate();
  const average = Math.round(state.groups.reduce((sum, group) => sum + group.progress, 0) / state.groups.length);
  const advance = () => {
    update({
      groups: state.groups.map((group) => ({ ...group, progress: Math.min(100, group.progress + 15), mission: Math.min(4, group.mission + (group.progress > 65 ? 1 : 0)) })),
      toast: "Avanço da turma simulado."
    });
  };
  return (
    <Screen step="04" eyebrow="Sessão em andamento" title="Acompanhe o progresso dos grupos" subtitle="Painel do professor em tempo real simulado, sem monitoramento invasivo.">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <Panel>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <StatusPill icon={<Leaf size={16} />} label="Código da sessão BIO-482" />
            <StatusPill icon={isOnline ? <Wifi size={16} /> : <WifiOff size={16} />} label={isOnline ? "Pronto para uso offline" : "Funcionando offline"} />
          </div>
          <div className="grid gap-3">
            {state.groups.map((group) => (
              <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[10rem_1fr_4rem] md:items-center" key={group.id}>
                <div className="flex items-center gap-3">
                  <span className={`h-5 w-5 rounded-full ${group.color}`} />
                  <div>
                    <p className="font-black">Grupo {group.name}</p>
                    <p className="text-xs text-slate-500">{group.members} estudantes</p>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${group.color}`} style={{ width: `${group.progress}%` }} />
                </div>
                <span className="text-sm font-black text-slate-600">Missão {group.mission} de 4</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="grid content-between gap-4">
          <div className="grid gap-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-500">Tempo restante</p>
              <p className="mt-1 flex items-center gap-2 text-4xl font-black text-navy-900"><Timer className="text-emerald-600" /> 12:43</p>
            </div>
            <InfoLine icon={<BookOpen />} label="Missão atual" value="Evidências da fotossíntese" />
            <InfoLine icon={<Users />} label="Grupos ativos" value={`${state.groups.length} grupos`} />
            <InfoLine icon={<MessageCircleWarning />} label="Dificuldade coletiva" value="Alguns grupos pediram exemplos de evidência." />
            <InfoLine icon={<ShieldCheck />} label="Privacidade" value="Nenhum app, mensagem ou localização coletados." />
          </div>
          <div className="rounded-3xl bg-emerald-50 p-4">
            <p className="font-black text-emerald-800">Tudo certo!</p>
            <p className="text-sm text-emerald-700">Atividade fluindo bem. Conclusão agregada: {average}%.</p>
          </div>
          <div className="grid gap-3">
            <button className="secondary-button justify-center" onClick={advance} type="button"><Rocket size={18} /> Simular avanço da turma</button>
            <button className="primary-button justify-center" onClick={() => { update({ sessionFinished: true, toast: "Sessão encerrada." }); navigate("/resumo"); }} type="button">Encerrar sessão <ArrowRight size={18} /></button>
          </div>
        </Panel>
      </div>
    </Screen>
  );
}

function StudentExperience({ state, update, isOnline }: { state: AppState; update: (patch: Partial<AppState>) => void; isOnline: boolean }) {
  return (
    <Screen step="05" eyebrow="Experiência do estudante" title="Interface simples, feita para uso em grupo" subtitle="Visualização mobile do Grupo Girassol.">
      <div className="grid place-items-center">
        <PhonePreview state={state} update={update} isOnline={isOnline} />
      </div>
    </Screen>
  );
}

function Reflection({ state, update }: { state: AppState; update: (patch: Partial<AppState>) => void }) {
  const navigate = useNavigate();
  const options: { id: FocusOption; icon: string; text: string }[] = [
    { id: "alto", icon: "☺", text: "Consegui me concentrar durante a maior parte do tempo." },
    { id: "medio", icon: "•", text: "Tive algumas distrações, mas consegui voltar." },
    { id: "baixo", icon: "☹", text: "Tive bastante dificuldade para me concentrar." }
  ];
  return (
    <Screen step="06" eyebrow="Finalização" title="Como foi seu foco hoje?" subtitle="Conta para gente como você se sentiu durante a atividade.">
      <Panel className="mx-auto max-w-2xl">
        <div className="grid gap-3">
          {options.map((option) => (
            <button className={`flex items-center gap-4 rounded-3xl border p-4 text-left transition ${state.reflection.focus === option.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`} key={option.id} onClick={() => update({ reflection: { ...state.reflection, focus: option.id } })} type="button">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-yellow-100 text-xl font-black text-navy-900">{option.icon}</span>
              <span className="font-bold text-slate-700">{option.text}</span>
            </button>
          ))}
        </div>
        <label className="mt-5 grid gap-2 text-sm font-bold text-slate-600">
          Reflexão opcional
          <textarea className="input min-h-28" value={state.reflection.note} onChange={(event) => update({ reflection: { ...state.reflection, note: event.target.value } })} placeholder="Escreva algo curto, se quiser." />
        </label>
        <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Essa reflexão pertence a você. O professor recebe apenas resultados gerais da turma.
        </div>
        <button className="primary-button mt-5 w-full justify-center" onClick={() => { update({ reflection: { ...state.reflection, completed: true }, toast: "Reflexão registrada somente neste navegador." }); navigate("/resumo"); }} type="button">
          Concluir atividade <CheckCircle2 size={18} />
        </button>
      </Panel>
    </Screen>
  );
}

function TeacherSummary({ state, update }: { state: AppState; update: (patch: Partial<AppState>) => void }) {
  const completion = Math.round(state.groups.reduce((sum, group) => sum + group.progress, 0) / state.groups.length);
  const completedGroups = state.groups.filter((group) => group.progress >= 80).length;
  return (
    <Screen step="07" eyebrow="Resumo da professora" title="Resumo coletivo e anônimo" subtitle="Resultados pedagógicos sem coleta de dados invasivos.">
      <div className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <Panel className="grid gap-4">
          <InfoCard icon={<CheckCircle2 />} title={`${completion}% de conclusão`} value={`${completedGroups} grupos concluíram as missões finais`} detail="Participação agregada da turma." />
          <InfoCard icon={<MessageCircleWarning />} title="Dificuldades principais" value="Identificar evidências visuais" detail="Sugestão: mostrar exemplos antes da próxima saída de observação." />
          <InfoCard icon={<ShieldCheck />} title="Privacidade preservada" value="Nenhum dado de aplicativos foi coletado" detail="Sem mensagens, localização, histórico ou capturas de tela." />
        </Panel>
        <Panel>
          <h3 className="text-2xl font-black text-navy-900">Conclusão por grupo</h3>
          <div className="mt-4 grid gap-3">
            {state.groups.map((group) => (
              <div className="rounded-3xl border border-slate-200 bg-white p-4" key={group.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-black">Grupo {group.name}</p>
                  <span className="text-sm font-black text-emerald-700">{group.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${group.color}`} style={{ width: `${group.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-lavenderLocal/10 p-5">
            <p className="font-black text-navy-900">Reflexão de foco coletiva</p>
            <p className="mt-2 text-slate-600">{state.reflection.completed ? "A maior parte da turma relatou foco suficiente para concluir a atividade, com distrações pontuais." : "Aguardando respostas dos estudantes. As respostas serão exibidas apenas de forma coletiva e anônima."}</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link className="secondary-button flex-1 justify-center" to="/">Voltar ao início</Link>
            <button className="primary-button flex-1 justify-center" onClick={() => update({ ...initialState(), toast: "Nova demonstração pronta." })} type="button">Reiniciar demonstração</button>
          </div>
        </Panel>
      </div>
    </Screen>
  );
}

function PhonePreview({ state, update, isOnline, compact = false }: { state: AppState; update?: (patch: Partial<AppState>) => void; isOnline?: boolean; compact?: boolean }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | undefined>(state.studentSubmission.photoName);
  const [hypothesis, setHypothesis] = useState(state.studentSubmission.hypothesis);
  const send = () => {
    update?.({ studentSubmission: { hypothesis, photoName: photo, sent: true }, toast: "Hipótese enviada pelo Grupo Girassol." });
    navigate("/reflexao");
  };
  return (
    <div className={`${compact ? "w-full" : "w-full max-w-sm"} rounded-[2.5rem] border-[10px] border-slate-950 bg-slate-950 p-2 shadow-laptop`}>
      <div className="rounded-[1.8rem] bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-black">09:41</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">{isOnline === false ? "Offline" : "Offline pronto"}</span>
        </div>
        <Logo />
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-100 text-2xl">●</span>
          <div>
            <h3 className="font-black text-navy-900">Grupo Girassol</h3>
            <p className="text-xs text-slate-500">Ciências · 8º ano</p>
          </div>
        </div>
        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-black text-navy-900">Missão 2 de 4</span>
            <div className="h-2 flex-1 rounded-full bg-slate-200"><div className="h-2 w-1/2 rounded-full bg-emerald-500" /></div>
          </div>
          <h4 className="font-black text-navy-900">Registre uma evidência de fotossíntese no ambiente.</h4>
          <p className="mt-2 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">Observem uma planta ao redor, registrem uma evidência e discutam como a luz participa desse processo.</p>
        </div>
        <div className="mt-3 grid gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-slate-700">
          <span><Clock3 size={16} className="mr-2 inline text-blue-600" />Tempo restante: 12:43</span>
          <span><Users size={16} className="mr-2 inline text-emerald-600" />Papéis: observador, fotógrafo, relator, porta-voz e guardião do foco.</span>
        </div>
        {!compact ? (
          <>
            <label className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
              Hipótese do grupo
              <textarea className="input min-h-24" value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} placeholder="A luz ajuda a planta a produzir seu alimento..." />
            </label>
            <div className="mt-3 grid grid-cols-[5rem_1fr] gap-3">
              <div className="grid h-20 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e8f9ef,#fef3c7)] text-emerald-700">
                {photo ? <Leaf /> : <Camera />}
              </div>
              <button className="secondary-button justify-center" onClick={() => setPhoto("folha-observada.jpg")} type="button"><Camera size={18} /> Adicionar foto</button>
            </div>
            <button className="primary-button mt-3 w-full justify-center" disabled={!hypothesis.trim()} onClick={send} type="button">Enviar resposta <Share2 size={18} /></button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Screen({ step, eyebrow, title, subtitle, children }: { step: string; eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/95 p-4 shadow-laptop md:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy-800 text-xl font-black text-white shadow-glow">{step}</span>
          <div>
            <p className="text-sm font-black text-emerald-700">{eyebrow}</p>
            <h2 className="text-2xl font-black text-navy-900 md:text-4xl">{title}</h2>
            <p className="mt-1 text-slate-600">{subtitle}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function Logo({ large = false }: { large?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`${large ? "h-14 w-14" : "h-8 w-8"} relative grid place-items-center rounded-full bg-emerald-100`}>
        <Leaf className="text-emerald-600" size={large ? 34 : 20} />
      </span>
      {!large ? <span className="font-black text-navy-900">Aula Local</span> : null}
    </div>
  );
}

function SideLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${isActive ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-100"}`} to={to}>
      {icon}
      {label}
    </NavLink>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}

function OfflineBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-emerald-800">
      <div className="flex items-center gap-3 font-black">
        {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
        {isOnline ? "Online" : "Funcionando offline"}
      </div>
      <p className="mt-1 text-sm font-semibold">Pronto para a escola sem internet.</p>
    </div>
  );
}

function StatusPill({ icon, label }: { icon: ReactNode; label: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">{icon}{label}</span>;
}

function InfoCard({ icon, title, value, detail }: { icon: ReactNode; title: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="mb-3 text-emerald-600">{icon}</div>
      <h3 className="text-xl font-black text-navy-900">{title}</h3>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-3xl bg-slate-50 p-4">
      <span className="text-emerald-600">{icon}</span>
      <div>
        <p className="text-sm font-black text-slate-500">{label}</p>
        <p className="font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-sm font-black text-slate-600">{label}{children}</label>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

function NumberInput({ value, suffix, onChange }: { value: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
      <input className="min-w-0 flex-1 border-0 bg-transparent py-3 font-bold outline-none" min={1} type="number" value={value} onChange={(event) => onChange(Math.max(1, Number(event.target.value)))} />
      <span className="text-sm font-bold text-slate-400">{suffix}</span>
    </div>
  );
}

function Choice({ selected, icon, title, text, onClick }: { selected: boolean; icon: ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button className={`rounded-3xl border p-5 text-left transition ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"}`} onClick={onClick} type="button">
      <div className="mb-2">{icon}</div>
      <p className="font-black">{title}</p>
      <p className="text-sm font-semibold">{text}</p>
    </button>
  );
}

export default App;
