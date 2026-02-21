import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

type ViewMode = 'login' | 'create';

export function AccountPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-sm bg-white p-8 shadow-sm md:p-12"
        >
          <h1 className="mb-8 text-center text-black">
            {viewMode === 'login' ? 'ACCOUNT' : 'CREATE AN ACCOUNT'}
          </h1>

          {viewMode === 'create' && (
            <p className="mb-8 text-center text-xs text-zinc-600">
              By creating an account, you agree to accept the{' '}
              <a href="#" className="underline">
                General Terms and Conditions of Use
              </a>{' '}
              and that your data will be processed in compliance with the{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>{' '}
              of Vines & Branches.
            </p>
          )}

          {viewMode === 'login' ? (
            <LoginForm onSwitchToCreate={() => setViewMode('create')} />
          ) : (
            <CreateAccountForm onSwitchToLogin={() => setViewMode('login')} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm({ onSwitchToCreate }: { onSwitchToCreate: () => void }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Login link sent to your email!');
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <p className="mb-6 text-center text-sm text-zinc-700">
        Please enter your email below to access or create your account
      </p>

      <div className="mb-6">
        <Label htmlFor="email" className="mb-2 block text-sm text-zinc-700">
          E-mail *
        </Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@domain.com"
          required
          className="h-12 rounded-none border-zinc-300"
        />
        <p className="mt-1 text-xs text-zinc-500">Expected format: yourname@domain.com</p>
      </div>

      <Button
        type="submit"
        className="mb-4 h-12 w-full rounded-none bg-zinc-800 hover:bg-black"
      >
        CONTINUE
      </Button>

      <p className="text-center text-sm text-zinc-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToCreate}
          className="underline hover:text-black"
        >
          Create one
        </button>
      </p>
    </form>
  );
}

function CreateAccountForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    title: '',
    firstName: '',
    lastName: '',
    areaCode: '+1',
    phone: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    location: 'United States',
    company: '',
    address: '',
    addressContinued: '',
    city: '',
    state: '',
    zipCode: '',
    zip: '',
    newsletter: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account created successfully!');
    onSwitchToLogin();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 text-right text-xs text-zinc-600">* Required information</div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* LOGIN INFORMATION */}
        <div>
          <h3 className="mb-4 text-sm text-black">LOGIN INFORMATION</h3>

          <div className="mb-4">
            <Label htmlFor="email" className="mb-2 block text-sm text-zinc-700">
              E-mail *
            </Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="yourname@domain.com"
              required
              className="h-12 rounded-none border-zinc-300"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Expected format: yourname@domain.com
            </p>
          </div>

          <div className="mb-4">
            <Label htmlFor="password" className="mb-2 block text-sm text-zinc-700">
              Password *
            </Label>
            <Input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300"
            />
            <div className="mt-2 text-xs text-zinc-500">
              <p>For your security, we invite you to fill your password according to the following criteria:</p>
              <ul className="mt-1 space-y-0.5">
                <li>• At least 10 characters</li>
                <li>• At least 1 uppercase letter</li>
                <li>• At least 1 number</li>
                <li>• At least 1 special character</li>
                <li>• At least 1 lowercase letter</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BILLING INFORMATION */}
        <div>
          <h3 className="mb-4 text-sm text-black">BILLING INFORMATION</h3>

          <div className="mb-4">
            <Label htmlFor="location" className="mb-2 block text-sm text-zinc-700">
                Location *
              </Label>
              <Select value={formData.location} onValueChange={(val: string) => handleChange('location', val)}>
                <SelectTrigger className="h-12 rounded-none border-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="company" className="mb-2 block text-sm text-zinc-700">
              Company
            </Label>
            <Input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="h-12 rounded-none border-zinc-300"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="address" className="mb-2 block text-sm text-zinc-700">
              Address *
            </Label>
            <Input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300"
            />
          </div>
        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm text-black">PERSONAL INFORMATION</h3>

          <div className="mb-4">
            <Label htmlFor="title" className="mb-2 block text-sm text-zinc-700">
              Title *
            </Label>
            <Select value={formData.title} onValueChange={(val: string) => handleChange('title', val)} required>
              <SelectTrigger className="h-12 rounded-none border-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr.">Mr.</SelectItem>
                <SelectItem value="Mrs.">Mrs.</SelectItem>
                <SelectItem value="Ms.">Ms.</SelectItem>
                <SelectItem value="Dr.">Dr.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="firstName" className="mb-2 block text-sm text-zinc-700">
              First name *
            </Label>
            <Input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="lastName" className="mb-2 block text-sm text-zinc-700">
              Last name *
            </Label>
            <Input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300"
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block text-sm text-zinc-700">
              Area code *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="text"
                value={formData.areaCode}
                onChange={(e) => handleChange('areaCode', e.target.value)}
                placeholder="+1"
                className="h-12 rounded-none border-zinc-300"
              />
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Telephone number *"
                required
                className="col-span-2 h-12 rounded-none border-zinc-300"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label className="mb-2 block text-sm text-zinc-700">Date of birth</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={formData.birthMonth} onValueChange={(val: string) => handleChange('birthMonth', val)}>
                <SelectTrigger className="h-12 rounded-none border-zinc-300">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">January</SelectItem>
                  <SelectItem value="02">February</SelectItem>
                  <SelectItem value="03">March</SelectItem>
                  <SelectItem value="04">April</SelectItem>
                  <SelectItem value="05">May</SelectItem>
                  <SelectItem value="06">June</SelectItem>
                  <SelectItem value="07">July</SelectItem>
                  <SelectItem value="08">August</SelectItem>
                  <SelectItem value="09">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                value={formData.birthDay}
                onChange={(e) => handleChange('birthDay', e.target.value)}
                placeholder="Day"
                className="h-12 rounded-none border-zinc-300"
              />
              <Input
                type="text"
                value={formData.birthYear}
                onChange={(e) => handleChange('birthYear', e.target.value)}
                placeholder="Year"
                className="h-12 rounded-none border-zinc-300"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <Label htmlFor="addressContinued" className="mb-2 block text-sm text-zinc-700">
              Address continued
            </Label>
            <Input
              type="text"
              id="addressContinued"
              value={formData.addressContinued}
              onChange={(e) => handleChange('addressContinued', e.target.value)}
              className="h-12 rounded-none border-zinc-300"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="city" className="mb-2 block text-sm text-zinc-700">
              City *
            </Label>
            <Input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="state" className="mb-2 block text-sm text-zinc-700">
              State *
            </Label>
            <Select value={formData.state} onValueChange={(val: string) => handleChange('state', val)} required>
              <SelectTrigger className="h-12 rounded-none border-zinc-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="zipCode" className="mb-2 block text-sm text-zinc-700">
              Zip code *
            </Label>
            <Input
              type="text"
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="zip" className="mb-2 block text-sm text-zinc-700">
              Zip +
            </Label>
            <Input
              type="text"
              id="zip"
              value={formData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              className="h-12 rounded-none border-zinc-300"
            />
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-8 flex items-start gap-3">
        <Checkbox
          id="newsletter"
          checked={formData.newsletter}
          onCheckedChange={(checked: boolean | undefined) => handleChange('newsletter', !!checked)}
        />
        <label htmlFor="newsletter" className="text-xs text-zinc-700">
          I agree to receive information by email about offers, services, products and events from
          Vines & Branches or other group companies, in accordance with the{' '}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
          <br />
          <br />
          You can unsubscribe from email marketing communications via the "Unsubscribe" link at the
          bottom of each of our email promotional communications.
        </label>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <Button
          type="submit"
          className="h-12 rounded-none bg-zinc-800 px-12 hover:bg-black"
        >
          CREATE AN ACCOUNT
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="underline hover:text-black"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
