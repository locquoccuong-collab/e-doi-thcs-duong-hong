import React, { useState, useEffect, useRef } from 'react';
import { loadAppState, saveAppState } from './utils/storage';
import { AppState, TabKey } from './types';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Views
import { DashboardView } from './views/DashboardView';
import { TroLyAiView } from './views/TroLyAiView';
import { ThiDuaTuanView } from './views/ThiDuaTuanView';
import { KhenThuongView } from './views/KhenThuongView';
import { SuViecView } from './views/SuViecView';
import { GuongTotView } from './views/GuongTotView';
import { BaoCaoZaloView } from './views/BaoCaoZaloView';
import { ChiDoiView } from './views/ChiDoiView';
import { DoiCoDoView } from './views/DoiCoDoView';
import { HoSoSoHoaView } from './views/HoSoSoHoaView';
import { LichCongTacView } from './views/LichCongTacView';
import { CauHinhTieuChiView } from './views/CauHinhTieuChiView';
import { CauHinhDonViView } from './views/CauHinhDonViView';
import { ThongBaoView } from './views/ThongBaoView';
import { SearchResultsView } from './views/SearchResultsView';
import { QuanLyHocSinhView } from './views/QuanLyHocSinhView';
import { RenLuyenDoiVienView } from './views/RenLuyenDoiVienView';
import { BchLienDoiView } from './views/BchLienDoiView';
import { KhoHoSoChiDoiView } from './views/KhoHoSoChiDoiView';
import { QuanTriDuLieuSaoLuuView } from './views/QuanTriDuLieuSaoLuuView';
import { QuanLyTaiKhoanBaoMatView } from './views/QuanLyTaiKhoanBaoMatView';
import { AuthUser, getSavedCurrentUser, setSavedCurrentUser, logoutUser, subscribeToAuthorizedUsers } from './utils/authService';
import { subscribeToFirestoreState, pushStateToFirestore } from './utils/firestoreSync';
import { LoginView } from './components/LoginView';

// Modals
import { ModalViPham } from './components/modals/ModalViPham';
import { ModalThongBao } from './components/modals/ModalThongBao';
import { ModalCoDo } from './components/modals/ModalCoDo';
import { ModalEditChiDoi } from './components/modals/ModalEditChiDoi';
import { ModalHoSoGroup } from './components/modals/ModalHoSoGroup';
import { ModalLichCongTac } from './components/modals/ModalLichCongTac';
import { ModalChiTietKeHoach } from './components/modals/ModalChiTietKeHoach';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<TabKey>('ban-lam-viec');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getSavedCurrentUser());
  const [hocKy, setHocKy] = useState<'HK1' | 'HK2' | 'CA_NAM'>('HK1');
  const [selectedWeek, setSelectedWeek] = useState<number>(8); // Week 8
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR'>('SYNCED');

  // Echo prevention and initial mount refs
  const isRemoteUpdateRef = useRef<boolean>(false);
  const isInitialMountRef = useRef<boolean>(true);

  // Modals state
  const [modalViPhamOpen, setModalViPhamOpen] = useState<boolean>(false);
  const [modalThongBaoOpen, setModalThongBaoOpen] = useState<boolean>(false);
  const [modalCoDoOpen, setModalCoDoOpen] = useState<boolean>(false);
  const [editingClassKey, setEditingClassKey] = useState<string | null>(null);
  const [selectedChiDoiHoSoKey, setSelectedChiDoiHoSoKey] = useState<string | null>(null);
  const [activeHoSoGroupId, setActiveHoSoGroupId] = useState<number | null>(null);
  const [modalLichOpen, setModalLichOpen] = useState<boolean>(false);
  const [detailPlanId, setDetailPlanId] = useState<number | null>(null);

  // Auto-sync state changes to localStorage cache
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Real-time synchronization from Cloud Firestore across sessions and devices
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToFirestoreState(
      (cloudState) => {
        if (cloudState && cloudState.listHocSinh && cloudState.listHocSinh.length > 0) {
          isRemoteUpdateRef.current = true;
          setAppState(cloudState);
          saveAppState(cloudState);
          setSyncStatus('SYNCED');
        }
      },
      (err) => {
        console.warn('Firestore realtime listener error:', err);
        setSyncStatus('ERROR');
      },
      appState,
      currentUser
    );
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Realtime subscription to 05 authorized users in Firestore
  useEffect(() => {
    if (!currentUser) return;
    const unsubUsers = subscribeToAuthorizedUsers((updatedUsers) => {
      const currentMatched = updatedUsers.find(
        (u) => u.email.toLowerCase() === currentUser.email.toLowerCase() || u.id === currentUser.id
      );
      if (currentMatched) {
        if (currentMatched.status === 'LOCKED') {
          logoutUser(currentUser);
          setCurrentUser(null);
          alert('Tài khoản của Thầy/Cô đã bị tạm khóa bởi Quản trị viên.');
        } else if (
          currentMatched.role !== currentUser.role ||
          currentMatched.scopeDiemTruong !== currentUser.scopeDiemTruong ||
          currentMatched.assignedClass !== currentUser.assignedClass
        ) {
          setCurrentUser(currentMatched);
          setSavedCurrentUser(currentMatched);
        }
      }
    });
    return () => unsubUsers();
  }, [currentUser]);

  // Debounced push to Cloud Firestore on local updates (300ms fast sync)
  useEffect(() => {
    if (!currentUser) return;
    if (!appState.listHocSinh || appState.listHocSinh.length === 0) return;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // If update arrived from Firestore remote, DO NOT echo it back
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setSyncStatus('SYNCING');
    const timer = setTimeout(() => {
      pushStateToFirestore(appState, {
        email: currentUser.email,
        role: currentUser.role,
        scopeDiemTruong: currentUser.scopeDiemTruong,
      })
        .then(() => setSyncStatus('SYNCED'))
        .catch((err) => {
          console.warn('Auto-sync to Firestore failed:', err);
          setSyncStatus('ERROR');
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [appState, currentUser]);

  // Dynamic ranking calculator based on configured thresholds
  const calculateXepLoai = (score: number) => {
    const th = appState.schoolConfig.diemThresholds || {
      xuatSac: 95,
      tot: 85,
      kha: 70,
    };
    if (score >= th.xuatSac) {
      return {
        text: 'Xuất sắc',
        bgClass: 'bg-emerald-100 border-emerald-300',
        textClass: 'text-emerald-800',
      };
    }
    if (score >= th.tot) {
      return {
        text: 'Tốt',
        bgClass: 'bg-blue-100 border-blue-300',
        textClass: 'text-blue-800',
      };
    }
    if (score >= th.kha) {
      return {
        text: 'Khá',
        bgClass: 'bg-amber-100 border-amber-300',
        textClass: 'text-amber-800',
      };
    }
    return {
      text: 'Cần cố gắng',
      bgClass: 'bg-red-100 border-red-300',
      textClass: 'text-red-800',
    };
  };

  const handleOpenEditChiDoi = (classKey: string) => {
    setEditingClassKey(classKey);
  };

  const handleOpenHoSoGroup = (groupId: number) => {
    setActiveHoSoGroupId(groupId);
  };

  // If not authenticated, display LoginView (never allow anonymous / unauthenticated access to data)
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setSavedCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans antialiased text-slate-800 selection:bg-red-700 selection:text-white">
      {/* Top Application Header */}
      <Header
        schoolConfig={appState.schoolConfig}
        hocKy={hocKy}
        setHocKy={setHocKy}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenModalViPham={() => setModalViPhamOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentUser={currentUser}
        onOpenAccountSettings={() => {
          if (currentUser.role === 'ADMIN') {
            setCurrentTab('quan-ly-tai-khoan');
          } else {
            alert(
              `Thầy/Cô đang đăng nhập với vai trò ${currentUser.role} (${currentUser.assignedScope}). Chỉ tài khoản ADMIN mới có quyền truy cập bảng bảo mật & quản lý 05 tài khoản.`
            );
          }
        }}
        onLogout={async () => {
          await logoutUser(currentUser);
          setCurrentUser(null);
        }}
        syncStatus={syncStatus}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setSearchQuery('');
          }}
          badgeSuViecCount={appState.listSuViec.length}
          badgeThongBaoCount={appState.listThongBao.length}
          schoolConfig={appState.schoolConfig}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          currentUser={currentUser}
        />

        {/* Dynamic Workspace Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 lg:p-6 pb-12">
          {searchQuery.trim().length > 0 ? (
            <SearchResultsView
              appState={appState}
              query={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setSearchQuery('');
              }}
              onOpenHoSoGroup={handleOpenHoSoGroup}
              onOpenEditChiDoi={handleOpenEditChiDoi}
            />
          ) : (
            <>
              {currentTab === 'ban-lam-viec' && (
                <DashboardView
                  appState={appState}
                  hocKy={hocKy}
                  selectedWeek={selectedWeek}
                  onSelectTab={setCurrentTab}
                  onOpenModalViPham={() => setModalViPhamOpen(true)}
                  onOpenModalThongBao={() => setModalThongBaoOpen(true)}
                  onOpenModalCoDo={() => setModalCoDoOpen(true)}
                />
              )}

              {currentTab === 'tro-ly-ai' && (
                <TroLyAiView
                  appState={appState}
                  setAppState={setAppState}
                  hocKy={hocKy}
                  selectedWeek={selectedWeek}
                />
              )}

              {currentTab === 'thi-dua-tuan' && (
                <ThiDuaTuanView
                  appState={appState}
                  setAppState={setAppState}
                  hocKy={hocKy}
                  selectedWeek={selectedWeek}
                  onOpenEditChiDoi={handleOpenEditChiDoi}
                  calculateXepLoai={calculateXepLoai}
                />
              )}

              {currentTab === 'thi-dua-khen-thuong' && (
                <KhenThuongView
                  appState={appState}
                  hocKy={hocKy}
                  selectedWeek={selectedWeek}
                  calculateXepLoai={calculateXepLoai}
                />
              )}

              {currentTab === 'su-viec' && (
                <SuViecView
                  appState={appState}
                  setAppState={setAppState}
                  hocKy={hocKy}
                  selectedWeek={selectedWeek}
                  onOpenModalViPham={() => setModalViPhamOpen(true)}
                />
              )}

              {currentTab === 'guong-tot' && (
                <GuongTotView
                  appState={appState}
                  onOpenModalViPham={() => setModalViPhamOpen(true)}
                />
              )}

              {currentTab === 'bao-cao-zalo' && (
                <BaoCaoZaloView
                  appState={appState}
                  hocKy={hocKy}
                  selectedWeek={selectedWeek}
                />
              )}

              {currentTab === 'quan-ly-hoc-sinh' && (
                <QuanLyHocSinhView
                  appState={appState}
                  setAppState={setAppState}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'ren-luyen-doi-vien' && (
                <RenLuyenDoiVienView
                  appState={appState}
                  setAppState={setAppState}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'chi-doi' && (
                <ChiDoiView
                  appState={appState}
                  onOpenEditChiDoi={handleOpenEditChiDoi}
                  onOpenHoSoChiDoi={(classKey) => {
                    setSelectedChiDoiHoSoKey(classKey);
                    setCurrentTab('kho-ho-so-chi-doi');
                  }}
                  onOpenKhoHoSo={() => {
                    setSelectedChiDoiHoSoKey(null);
                    setCurrentTab('kho-ho-so-chi-doi');
                  }}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'kho-ho-so-chi-doi' && (
                <KhoHoSoChiDoiView
                  appState={appState}
                  setAppState={setAppState}
                  defaultClassKey={selectedChiDoiHoSoKey || undefined}
                  onBackToChiDoi={() => {
                    setCurrentTab('chi-doi');
                    setSelectedChiDoiHoSoKey(null);
                  }}
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'bch-lien-doi' && (
                <BchLienDoiView
                  appState={appState}
                  setAppState={setAppState}
                />
              )}

              {currentTab === 'doi-co-do' && (
                <DoiCoDoView
                  appState={appState}
                  setAppState={setAppState}
                  onOpenModalCoDo={() => setModalCoDoOpen(true)}
                />
              )}

              {currentTab === 'ho-so-so-hoa' && (
                <HoSoSoHoaView
                  appState={appState}
                  onOpenHoSoGroup={handleOpenHoSoGroup}
                  onOpenKhoHoSo={() => {
                    setSelectedChiDoiHoSoKey(null);
                    setCurrentTab('kho-ho-so-chi-doi');
                  }}
                />
              )}

              {currentTab === 'lich-cong-tac' && (
                <LichCongTacView
                  appState={appState}
                  setAppState={setAppState}
                  onOpenModalLich={() => setModalLichOpen(true)}
                  onOpenHoSoGroup={handleOpenHoSoGroup}
                />
              )}

              {currentTab === 'thong-bao' && (
                <ThongBaoView
                  appState={appState}
                  setAppState={setAppState}
                  onOpenModalThongBao={() => setModalThongBaoOpen(true)}
                />
              )}

              {currentTab === 'cau-hinh-tieu-chi' && (
                <CauHinhTieuChiView
                  appState={appState}
                  setAppState={setAppState}
                />
              )}

              {currentTab === 'cau-hinh-don-vi' && (
                <CauHinhDonViView
                  appState={appState}
                  setAppState={setAppState}
                  onOpenQuanTriDuLieu={() => setCurrentTab('quan-tri-du-lieu')}
                />
              )}

              {currentTab === 'quan-tri-du-lieu' && (
                <QuanTriDuLieuSaoLuuView
                  appState={appState}
                  setAppState={setAppState}
                  onOpenQuanLyTaiKhoan={() => setCurrentTab('quan-ly-tai-khoan')}
                />
              )}

              {currentTab === 'quan-ly-tai-khoan' && (
                <QuanLyTaiKhoanBaoMatView
                  appState={appState}
                  setAppState={setAppState}
                  currentUser={currentUser}
                  setCurrentUser={(u) => {
                    setCurrentUser(u);
                    setSavedCurrentUser(u);
                  }}
                  onOpenQuanTriDuLieu={() => setCurrentTab('quan-tri-du-lieu')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ModalViPham
        isOpen={modalViPhamOpen}
        onClose={() => setModalViPhamOpen(false)}
        appState={appState}
        setAppState={setAppState}
        hocKy={hocKy}
        selectedWeek={selectedWeek}
      />

      <ModalThongBao
        isOpen={modalThongBaoOpen}
        onClose={() => setModalThongBaoOpen(false)}
        appState={appState}
        setAppState={setAppState}
      />

      <ModalCoDo
        isOpen={modalCoDoOpen}
        onClose={() => setModalCoDoOpen(false)}
        appState={appState}
        setAppState={setAppState}
      />

      <ModalEditChiDoi
        isOpen={editingClassKey !== null}
        onClose={() => setEditingClassKey(null)}
        classKey={editingClassKey}
        appState={appState}
        setAppState={setAppState}
      />

      <ModalHoSoGroup
        isOpen={activeHoSoGroupId !== null}
        onClose={() => setActiveHoSoGroupId(null)}
        groupId={activeHoSoGroupId}
        appState={appState}
        setAppState={setAppState}
        onOpenEditChiDoi={handleOpenEditChiDoi}
        onOpenPlanDetail={(pId) => setDetailPlanId(pId)}
        onOpenKhoHoSo={(classKey) => {
          setSelectedChiDoiHoSoKey(classKey || null);
          setCurrentTab('kho-ho-so-chi-doi');
        }}
      />

      <ModalLichCongTac
        isOpen={modalLichOpen}
        onClose={() => setModalLichOpen(false)}
        appState={appState}
        setAppState={setAppState}
        onOpenPlanDetail={(pId) => setDetailPlanId(pId)}
      />

      <ModalChiTietKeHoach
        isOpen={detailPlanId !== null}
        onClose={() => setDetailPlanId(null)}
        planId={detailPlanId}
        appState={appState}
        setAppState={setAppState}
        onOpenHoSoGroup={handleOpenHoSoGroup}
      />
    </div>
  );
}
