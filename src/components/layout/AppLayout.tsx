import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Calculator, 
  Wallet, 
  FileText, 
  Download,
  Sun,
  Moon,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Daily Review', href: '/daily-review', icon: FileText },
  { name: 'Calculator', href: '/calculator', icon: Calculator },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Backup', href: '/backup', icon: Download },
];

const NavItem: React.FC<{ item: typeof navigation[0]; onClick?: () => void }> = ({ item, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        "hover:bg-primary/10",
        isActive 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{item.name}</span>
    </NavLink>
  );
};

const Sidebar: React.FC<{ onNavClick?: () => void }> = ({ onNavClick }) => {
  const { accounts, selectedAccount, selectAccount, theme, toggleTheme } = useApp();
  
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="p-2 bg-primary rounded-lg">
          <TrendingUp className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Trading Journal</h1>
          <p className="text-xs text-muted-foreground">Pro Edition</p>
        </div>
      </div>
      
      {/* Account Selector */}
      <div className="px-4 py-4 border-b border-border">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Active Account
        </label>
        <Select 
          value={selectedAccount?.id || ''} 
          onValueChange={selectAccount}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <span className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    account.type === 'Live' && "bg-green-500",
                    account.type === 'Demo' && "bg-blue-500",
                    account.type === 'Prop Firm' && "bg-purple-500",
                    account.type === 'Personal' && "bg-orange-500"
                  )} />
                  {account.name}
                </span>
              </SelectItem>
            ))}
            {accounts.length === 0 && (
              <SelectItem value="none" disabled>
                No accounts yet
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {selectedAccount && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Balance: </span>
            <span className="font-semibold text-foreground">
              {selectedAccount.currency}{selectedAccount.currentBalance.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} onClick={onNavClick} />
        ))}
      </nav>
      
      {/* Theme Toggle */}
      <div className="px-4 py-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-5 w-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </aside>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Trading Journal</span>
          </div>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar onNavClick={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 lg:pl-72">
        <div className="pt-16 lg:pt-0 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
